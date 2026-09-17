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
        self._db = db

    def get_by_tracking(self, tracking_number: str) -> ShipmentAssign | None:
        return (
            self._db.query(ShipmentAssign)
            .filter(ShipmentAssign.tracking_number == tracking_number)
            .first()
        )

    def delete_shipment(
        self, shipment_to_inactive: ShipmentAssign, who_deleted: str
    ) -> str | None:
        shipment_to_inactive.is_active = False

        for event in shipment_to_inactive.events:
            event.is_active = False
            event.last_modify = datetime.now(timezone.utc)
            event.capure_by_id = who_deleted

        self.save(shipment_to_inactive)

        return shipment_to_inactive.customer_tracking

    def create(self, shipment_data: ShipmentAssign):
        self.save(shipment_data)

    def get_shipment(self, id: int) -> ShipmentAssign:
        shipment_id = (
            self._db.query(ShipmentAssign).filter(ShipmentAssign.id == id).first()
        )
        if not id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Shipment with {id} not found",
            )
        return shipment_id

    def update_shipment(self, id: int, shipment_data: ShipmentUpdate):
        shipment = self.get_shipment(id)

        data_update = shipment_data.model_dump(exclude_unset=True)
        for k, v in data_update.items():
            if k == "events" and v is not None:
                shipment.events = [
                    ShipmentEventModel(**event)
                    for event in v
                    if event.get("dateTime") is not None
                ]
            else:
                setattr(shipment, k, v)
        self._db.commit()
        self._db.refresh(shipment)
        return shipment

    def get_all_shipments(self, page: int = 1, limit: int = 10) -> List[ShipmentAssign]:
        shipments = (
            self._db.query(ShipmentAssign).offset((page - 1) * limit).limit(limit).all()
        )
        return shipments
