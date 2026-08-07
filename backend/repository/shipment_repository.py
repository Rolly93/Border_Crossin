from sqlalchemy.orm import Session
from model.db_model import ShipmentAssign


class ShipmentRepository:
    def __init__(self, db: Session):
        self._db = db

    def get_by_tracking(self, tracking_number: str) -> ShipmentAssign | None:
        return (
            self._db.query(ShipmentAssign)
            .filter(ShipmentAssign.tracking_number == tracking_number)
            .first()
        )

    def create(self, shipment_data: dict) -> ShipmentAssign:
        db_shipment = ShipmentAssign(**shipment_data)
        self._db.add(db_shipment)
        self._db.commit()
        self._db.refresh(db_shipment)
        return db_shipment
