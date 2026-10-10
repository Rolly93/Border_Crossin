from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from model.db_model import ShipmentAssign, ShipmentEventModel
from schema.shipment_shcema import ShipmentUpdate
from repository.base_repository import BaseRepository


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
            event.last_modify = datetime.now(timezone.utc)
            event.capture_by_id = who_deleted

        self.save(shipment_to_inactive)

        return shipment_to_inactive.customer_tracking

    def create(self, shipment_data: ShipmentAssign):
        self.save(shipment_data)

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
        self, id: int, shipment_data: ShipmentUpdate, user_id: int
    ) -> ShipmentAssign:
        shipment = self.get_shipment(id)

        # Campos del embarque (cliente se guarda en client_id)
        column_map = {"cliente": "client_id"}
        for field, value in shipment_data.model_dump(
            exclude={"events"}, exclude_unset=True
        ).items():
            column = column_map.get(field, field)
            if value is not None and hasattr(shipment, column):
                setattr(shipment, column, value)

        # Los eventos se AGREGAN al historial; no se reemplazan para no
        # borrar eventos ya enviados (sftp_send los referencia).
        events = (
            shipment_data.events
            if isinstance(shipment_data.events, list)
            else [shipment_data.events]
        )
        for e in events:
            if e.dateTime is None:
                continue
            shipment.events.append(
                ShipmentEventModel(
                    category=e.category.value,
                    event_time=e.dateTime,
                    notes=e.notes,
                    trip_assigned_id=id,
                    capture_by_id=user_id,
                )
            )

        self._db.commit()
        self._db.refresh(shipment)
        return shipment

    def get_all_shipments(self, page: int = 1, limit: int = 10) -> List[ShipmentAssign]:
        shipments = (
            self._db.query(ShipmentAssign).offset((page - 1) * limit).limit(limit).all()
        )
        return shipments
