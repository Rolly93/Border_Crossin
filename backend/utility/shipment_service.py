import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from model.db_model import (
    Consolidate,
    SftpSend,
    ShipmentAssign,
    ShipmentEventModel,
    Trailer,
)
from repository import ShipmentRepository
from repository.cliente_repository import ClientServiceType
from repository.consolidated_repository import ConsolidateRepository
from repository.system_config_repository import SystemConfigRepository
from repository.trailer_repository import TrailerRepository
from repository.unit_repository import UnitRepository
from schema.shipment_shcema import (
    ConsolidateGuideItemResponse,
    ConsolidateResponse,
    ConsolodateGuideCreate,
    EventCategory,
    PaginatedShipmentResponse,
    ServiceType,
    ServiceTypeUnionRequest,
    ServiceTypeUnionRequestUpdate,
    ServiceTypeUnionResponse,
    ShipmentCreateRequest,
    ShipmentEvent,
    ShipmentUpdate,
    TrailerCreate,
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
        self._consolidate_repo = ConsolidateRepository(self.db)
        self._trailer_objt: Trailer | None = None
        self._consolidate_obj: list[Consolidate] | Consolidate | None = None

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
        truck_value = (
            getattr(s.truck, "unit_number", None)
            or getattr(s.truck, "number", None)
            or (str(s.unit_truck_id) if s.unit_truck_id is not None else "")
        )
        if s.service_type == ServiceType.CONSOLIDATED:
            service_shipment_data = ConsolidateResponse(
                id=s.id,
                tracking_number=s.tracking_number,
                customer_tracking=s.customer_tracking,
                service_type=ServiceType.CONSOLIDATED,
                cliente=s.client_id,
                origen=s.origen,
                destination=s.destination,
                truck=truck_value,
                events=events,
                consolidate_guide=[
                    ConsolidateGuideItemResponse(
                        id=g.id,
                        client_id=g.client_id,
                        guide_number=g.guide_number,
                        pieces=g.pieces,
                        weight=g.weight,
                    )
                    for g in s.consolidate_guide
                ],
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
                truck=truck_value,
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
        trailer_obj: Trailer | None = None
        if data.service_type == ServiceType.TRAILER:
            trailer_data = TrailerCreate(
                plates=data.plates,
                seal=data.seal,
                trailer_number=data.trailer_number,
                state=data.state,
            )
            trailer_obj = self._trailer_repo.create_trailer(trailer_data)

        # =====================================================
        # CREAR SHIPMENT
        # =====================================================

        s = ShipmentCreateRequest(
            tracking_number=data.tracking_number,
            customer_tracking=data.customer_tracking,
            type_operation=data.type_operation,
            cliente=data.cliente,
            origen=data.origen,
            truck=str(unit.id),
            destination=data.destination,
        )

        shipment = self._shipment_db.create(
            data=s,
            driver_id=assignment.driver_id,
            service_type=ServiceType(data.service_type),
            user_id=user_id,
            new_trailer=self._trailer_objt,
            new_consolidate=[],
        )
        # =====================================================
        # CONSOLIDATED
        # =====================================================

        if data.service_type == ServiceType.CONSOLIDATED and data.consolidate_guide:
            new_consolidate = [
                ConsolodateGuideCreate(
                    client_id=int(g.client_id),
                    trip_assigned_id=shipment.id,
                    guide_number=g.guide_number,
                    weight=g.weight,
                    pieces=g.pieces,
                )
                for g in data.consolidate_guide
            ]

            self._consolidate_obj = self._consolidate_repo.create_consolidate(
                new_consolidate, client=client
            )
            self.db.refresh(shipment)

        return shipment

    def delete_shipmnet(self, id: int, user: int) -> str | None:
        shipment_found = self._shipment_db.get_shipment(id)

        shipment_delete = self._shipment_db.delete_shipment(shipment_found, user)
        return shipment_delete

    def update_shipment(
        self,
        shipment_id: int,
        shipment_data: ServiceTypeUnionRequestUpdate,
        user_id: int,
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
    ) -> list[SftpSend]:
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
