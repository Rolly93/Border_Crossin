import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from model.db_model import (
    Consolidate,
    ShipmentAssign,
    ShipmentEventModel,
    Trailer,
)
from repository import ShipmentRepository
from repository.cliente_repository import ClientServiceType
from repository.system_config_repository import SystemConfigRepository
from repository.trailer_repository import TrailerRepository
from repository.unit_repository import UnitRepository
from schema.shipment_shcema import (
    ConsolidateResponse,
    EventCategory,
    PaginatedShipmentResponse,
    ServiceType,
    ServiceTypeUnionRequest,
    ServiceTypeUnionResponse,
    ShipmentEvent,
    ShipmentUpdate,
    TrailerResponse,
)
from service.shipment_dispatch_service import ShipmentDispatchService
from utility.cliente_service import ClienteService
from utility.reference_rule_service import ReferenceRuleService

logger = logging.getLogger(__name__)


class ShipmentService:
    def __init__(self, db: Session):
        self.db: Session = db
        self._shipment_db = ShipmentRepository(self.db)
        self._client_service = ClienteService(self.db)
        self._reference_rule = ReferenceRuleService(self.db)
        self._unit_repo = UnitRepository(self.db)
        self._trailer_repo = TrailerRepository(self.db)

    def get_all_shipments(
        self, page: int = 1, limit: int = 10
    ) -> PaginatedShipmentResponse:
        raw_shipments, total = self._shipment_db.get_all_shipments(page, limit)

        return PaginatedShipmentResponse(
            data=[self._to_response(s) for s in raw_shipments],
            totalRecords=total,
            hasNextPage=(page * limit) < total,
            page=page,
            limit=limit,
        )

    @staticmethod
    def _to_response(s: ShipmentAssign) -> ServiceTypeUnionResponse:
        # truck y trailer son relaciones ORM; el esquema espera su texto (número / placas).
        valid_categories = {c.value for c in EventCategory}
        events = [
            ShipmentEvent(
                category=EventCategory(e.category), dateTime=e.event_time, notes=e.notes
            )
            for e in s.events
            if e.event_time and e.category in valid_categories
        ]
        service_shipment_data: ServiceTypeUnionResponse | None = None

        if s.service_type == ServiceType.CONSOLIDATED:
            g = s.consolidate_guide[0]
            service_shipment_data = ConsolidateResponse(
                id=s.id,
                tracking_number=s.tracking_number,
                customer_tracking=s.customer_tracking,
                service_type=ServiceType.CONSOLIDATED,
                guide_number=g.guide_number,
                client_id=s.client_id,
                pices=g.pieces or 0,
                weight=g.weight or 0,
                cliente=s.client_id,
                origen=s.origen,
                destination=s.destination,
                truck=str(s.truck),
                events=events,
            )
        if s.service_type == ServiceType.TRAILER and s.trailer:
            service_shipment_data = TrailerResponse(
                id=s.id,
                service_type=ServiceType.TRAILER,
                trailer_number=s.trailer.trailer_number,
                plates=s.trailer.plates,
                state=s.trailer.state,
                seal=s.trailer.seal,
                tracking_number=s.tracking_number,
                customer_tracking=s.customer_tracking,
                cliente=s.client_id,
                origen=s.origen,
                destination=s.destination,
                truck=str(s.truck),
                events=events,
            )
        if not service_shipment_data:
            raise ValueError(
                "El embarque no cuenta con un servicio válido asociado (Consolidado o Tráiler)."
            )

        return service_shipment_data

    def create_shipment(
        self, data: ServiceTypeUnionRequest, user_id: int
    ) -> ShipmentAssign:
        client = self._client_service.get_client(data)

        if self._shipment_db.get_by_tracking(data.tracking_number):
            raise HTTPException(
                status.HTTP_409_CONFLICT, "Ese número de embarque ya existe"
            )

        self._reference_rule.validate(
            client_id=data.cliente,
            operation=data.type_operation,
            reference=data.customer_tracking,
        )

        # La unidad debe estar activa y tener un operador vigente: el operador es quien maneja.
        if not (data_unit := (self._unit_repo.get_unit_by_number(data.truck))):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Unidad no encontrada")
        unit = data_unit
        if unit.state != "ACTIVA":
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"La unidad {data.truck} no está activa (estado: {unit.state})",
            )
        if not (assignment := self._unit_repo.get_open_assignment(unit.id)):
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"La unidad {data.truck} no tiene operador asignado",
            )
        if not data.service_type:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail="Falta Caputar el Tipo de Servicio"
            )

        trailer_objt = None
        consolidate_objt = None
        if data.service_type == ServiceType.CONSOLIDATED:
            consolidate_objt = Consolidate(
                client_id=data.cliente,
                guide_number=data.guide_number,
                pieces=int(data.pices),
                weight=data.weight,
            )
            self.db.add(consolidate_objt)
            self.db.flush()

        elif data.service_type == ServiceType.TRAILER:
            trailer_objt = Trailer(
                plates=data.plates,
                trailer_number=data.trailer_number,
                state=data.state,
                seal=data.seal,
            )
            self.db.add(trailer_objt)
            self.db.flush()

        else:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Tipo de Servicio Invalido")

        shipment = ShipmentAssign(
            tracking_number=data.tracking_number,
            customer_tracking=data.customer_tracking,
            type_operation=data.type_operation,
            truck=assignment.driver_id,
            client_id=client.id,
            assigned_by=user_id,
            unit_truck_id=unit.id,
            origen=data.origen,
            destination=data.destination,
            is_active=True,
            trailer_id=trailer_objt.id if trailer_objt else None,
            service_type=data.service_type,
        )

        if consolidate_objt:
            shipment.consolidate_guide.append(consolidate_objt)

        self.db.add(shipment)
        self.db.commit()
        self.db.refresh(shipment)
        return shipment

    def delete_shipmnet(self, id: int, user: int) -> str | None:
        shipment_found = self._shipment_db.get_shipment(id)

        shipment_delete = self._shipment_db.delete_shipment(shipment_found, user)
        return shipment_delete

    def update_shipment(
        self, shipment_id: int, shipment_data: ShipmentUpdate, user_id: int
    ) -> ShipmentAssign:
        current = self._shipment_db.get_shipment(shipment_id)
        self._reference_rule.validate(
            client_id=shipment_data.cliente,
            operation=shipment_data.type_operation or current.type_operation,
            reference=shipment_data.customer_tracking or current.customer_tracking,
        )

        shipment, new_events = self._shipment_db.update_shipment(
            shipment_id, shipment_data, user_id
        )
        self.sftp_service(shipment, new_events)
        return shipment

    def sftp_service(
        self, shipment: ShipmentAssign, events: list[ShipmentEventModel]
    ) -> list:
        if not events:
            return []

        client_data = self._client_service.get_client_service(
            shipment.client_id, ClientServiceType.SFTP
        )
        if not client_data or not client_data.sftService:
            return []

        scac = SystemConfigRepository(self.db).get_scac()
        dispatcher = ShipmentDispatchService(self.db, client_data.sftService, scac)
        return dispatcher.dispatch_events(events)

    def email_service(self, shipment: ShipmentUpdate):
        pass
