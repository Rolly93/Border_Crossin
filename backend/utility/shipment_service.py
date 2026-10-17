import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from model.db_model import (
    Client,
    ShipmentAssign,
    ShipmentEventModel,
    Trailer,
    UnitAssignment,
    UnitTruck,
)
from repository import ShipmentRepository
from repository.system_config_repository import SystemConfigRepository
from schema.shipment_shcema import (
    EventCategory,
    PaginatedShipmentResponse,
    ShipmentCreateRequest,
    ShipmentEvent,
    ShipmentResponse,
    ShipmentUpdate,
)
from service.shipment_dispatch_service import ShipmentDispatchService
from utility.cliente_service import ClienteService
from utility.reference_rule_service import ReferenceRuleService

logger = logging.getLogger(__name__)


class ShipmentService:
    def __init__(self, db: Session):
        self.db = db
        self._shipment_db = ShipmentRepository(db)
        self._client_service = ClienteService(db)

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
    def _to_response(s: ShipmentAssign) -> ShipmentResponse:
        # truck y trailer son relaciones ORM; el esquema espera su texto (número / placas).
        valid_categories = {c.value for c in EventCategory}
        events = [
            ShipmentEvent(
                category=EventCategory(e.category), dateTime=e.event_time, notes=e.notes
            )
            for e in s.events
            if e.event_time and e.category in valid_categories
        ]
        return ShipmentResponse(
            id=s.id,
            tracking_number=s.tracking_number,
            customer_tracking=s.customer_tracking,
            type_operation=s.type_operation,
            origen=s.origen,
            destination=s.destination,
            cliente=str(s.client_id),
            truck=s.truck.unit_number if s.truck else None,
            trailer=s.trailer.plates if s.trailer else None,
            events=events,
        )

    def create_shipment(
        self, data: ShipmentCreateRequest, user_id: int
    ) -> ShipmentAssign:
        client = self.db.get(Client, data.cliente)
        if not client or not client.still_active:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "Cliente no encontrado o inactivo"
            )

        if (
            self.db.query(ShipmentAssign)
            .filter(ShipmentAssign.tracking_number == data.tracking_number)
            .first()
        ):
            raise HTTPException(
                status.HTTP_409_CONFLICT, "Ese número de embarque ya existe"
            )

        ReferenceRuleService(self.db).validate(
            client_id=data.cliente,
            operation=data.type_operation,
            reference=data.customer_tracking,
        )

        # La unidad debe estar activa y tener un operador vigente: el operador es quien maneja.
        unit = (
            self.db.query(UnitTruck).filter(UnitTruck.unit_number == data.truck).first()
        )
        if not unit:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, f"Unidad {data.truck} no encontrada"
            )
        if unit.state != "ACTIVA":
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"La unidad {data.truck} no está activa (estado: {unit.state})",
            )
        assignment = (
            self.db.query(UnitAssignment)
            .filter(
                UnitAssignment.unit_id == unit.id, UnitAssignment.released_at.is_(None)
            )
            .first()
        )
        if not assignment:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"La unidad {data.truck} no tiene operador asignado",
            )

        trailer = self.db.query(Trailer).filter(Trailer.plates == data.trailer).first()
        if not trailer:
            trailer = Trailer(plates=data.trailer, state="ACTIVA")
            self.db.add(trailer)
            self.db.flush()

        shipment = ShipmentAssign(
            tracking_number=data.tracking_number,
            customer_tracking=data.customer_tracking,
            type_operation=data.type_operation,
            driver_id=assignment.driver_id,
            client_id=data.cliente,
            assigned_by=user_id,
            trailer_id=trailer.id,
            unit_truck_id=unit.id,
            origen=data.origen,
            destination=data.destination,
            is_active=True,
        )
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
        ReferenceRuleService(self.db).validate(
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
            shipment.client_id, "sftp_service"
        )
        if not client_data or not client_data.sftService:
            return []

        scac = SystemConfigRepository(self.db).get_scac()
        dispatcher = ShipmentDispatchService(self.db, client_data.sftService, scac)
        return dispatcher.dispatch_events(events)

    def email_service(self, shipment: ShipmentUpdate):
        pass
