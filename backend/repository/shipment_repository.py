from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from model.db_model import ShipmentAssign, ShipmentEventModel
from schema.shipment_shcema import ShipmentUpdate


class ShipmentRepository:
    def __init__(self, db: Session):
        self._db = db

    def get_by_tracking(self, tracking_number: str) -> ShipmentAssign | None:
        return (
            self._db.query(ShipmentAssign)
            .filter(ShipmentAssign.tracking_number == tracking_number)
            .first()
        )

    def create(self, shipment_data: ShipmentAssign):
        self._db.add(shipment_data)
        self._db.commit()
        self._db.refresh(shipment_data)

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
