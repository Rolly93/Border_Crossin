from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from model.shipment_model import ShipmentModel, ShipmentEventModel
from schema.shipment_shcema import ShipmentCreate, ShipmentUpdate


class ShipmentService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_shipments(self):
        return self.db.query(ShipmentModel).all()

    def create_shipment(self, shipment: ShipmentCreate):
        db_shipment = ShipmentModel(**shipment.model_dump())
        self.db.add(db_shipment)
        self.db.commit()
        self.db.refresh(db_shipment)
        return db_shipment

    def update_shipment(self, shipment_id: int, shipment_data: ShipmentUpdate):
        db_shipment = (
            self.db.query(ShipmentModel).filter(ShipmentModel.id == shipment_id).first()
        )

        if not db_shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Shipment with id {shipment_id} not found",
            )

        update_data = shipment_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if key == "events" and value is not None:
                db_shipment.events = [
                    ShipmentEventModel(**event)
                    for event in value
                    if event.get("dateTime") is not None
                ]
            else:
                setattr(db_shipment, key, value)

        self.db.commit()
        self.db.refresh(db_shipment)
        return db_shipment
