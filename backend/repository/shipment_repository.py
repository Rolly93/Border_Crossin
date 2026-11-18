from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from model.db_model import ShipmentAssign, ShipmentEventModel, Trailer
from repository.base_repository import BaseRepository
from schema.shipment_shcema import (
    ServiceType,
    ServiceTypeUnionRequestUpdate,
    ShipmentCreateRequest,
)
import service


class ShipmentRepository(BaseRepository[ShipmentAssign]):
    def __init__(self, db: Session):
        super().__init__(db, model=ShipmentAssign)

        self._db_shipment_event = ShipmentEventModel
        self._db = db

    def get_by_tracking(self, tracking_number: str) -> ShipmentAssign | None:
        return (
            self._db.query(ShipmentAssign)
            .filter(ShipmentAssign.tracking_number == tracking_number)
            .first()
        )

    def delete_shipment(
        self, shipment_to_inactive: ShipmentAssign, who_deleted: int
    ) -> str | None:
        shipment_to_inactive.is_active = False

        for event in shipment_to_inactive.events:
            event.is_active = False
            event.last_modify = datetime.now(tz=UTC)
            event.capture_by_id = who_deleted

        self.save(shipment_to_inactive)

        return shipment_to_inactive.customer_tracking

    def create(
        self,
        data: ShipmentCreateRequest,
        driver_id: int,
        service_type: ServiceType,
        user_id: int,
        new_trailer: Trailer | None,
    ) -> ShipmentAssign:
        new_assgiment_shipment = ShipmentAssign(
            tracking_number=data.tracking_number,
            customer_tracking=data.customer_tracking,
            type_operation=data.type_operation,
            driver_id=driver_id,
            client_id=data.cliente,
            assigned_by=user_id,
            service_type=service_type,
            unit_truck_id=int(data.truck),
            origen=data.origen,
            destination=data.destination,
            is_active=True,
            trailer_id=new_trailer,
        )
        return self.save(new_assgiment_shipment)

    def get_shipment(self, id: int) -> ShipmentAssign:
        shipment_id = (
            self._db.query(ShipmentAssign).filter(ShipmentAssign.id == id).first()
        )
        if not shipment_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Shipment with {id} not found",
            )
        return shipment_id

    def update_shipment(
        self, id: int, shipment_data: ServiceTypeUnionRequestUpdate, user_id: int
    ):

        shipment = self.get_shipment(id)

        column_map = {"cliente": "client_id"}

        shipment_events = shipment_data.model_dump(
            exclude={"events"}, exclude_unset=True
        )
        for field, value in shipment_events.items():
            column = column_map.get(field, field)
            if value is not None and hasattr(shipment, column):
                setattr(shipment, column, value)

        # Los eventos se AGREGAN al historial (no se reemplazan): sftp_send
        # referencia eventos existentes y el cascade borraría su historial.

        events = (
            shipment_data.events
            if isinstance(shipment_data.events, list)
            else [shipment_data.events]
        )

        new_events: list[ShipmentEventModel] = []
        for e in events:
            if e is None:
                continue
            new_event = ShipmentEventModel(
                category=e.category.value,
                event_time=e.dateTime,
                notes=e.notes,
                trip_assigned_id=id,
                capture_by_id=user_id,
            )
            shipment.events.append(new_event)
            new_events.append(new_event)

        self._db.commit()
        self._db.refresh(shipment)
        for event in new_events:
            self._db.refresh(event)
        return shipment, new_events

    def get_all_shipments(
        self, page: int = 1, limit: int = 10
    ) -> tuple[list[ShipmentAssign], int]:
        query = self._db.query(ShipmentAssign)
        total = query.count()
        shipments = query.offset((page - 1) * limit).limit(limit).all()
        return shipments, total
