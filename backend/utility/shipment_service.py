from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from service.XML_generator import XMLService
from service.sftp import SFPTService
from utility.cliente_service import ClienteService
from model.db_model import ShipmentAssign, ShipmentEventModel
from schema.shipment_shcema import ShipmentCreate, ShipmentUpdate
from repository import ShipmentRepository


class ShipmentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo_db = ShipmentRepository(db)
        self._client_service = ClienteService(db)

    def get_all_shipments(self):
        return self.db.query(ShipmentAssign).all()

    def create_shipment(self, shipment: ShipmentCreate):
        db_shipment = ShipmentAssign(**shipment.model_dump())
        self.repo_db.create(db_shipment)
        return db_shipment

    def update_shipment(self, shipment_id: int, shipment_data: ShipmentUpdate):
        shipment_update = self.repo_db.update_shipment(shipment_id, shipment_data)
        self._client_service.it_has_sfpt_notification(
            shipment_update.client_id, shipment_data
        )
        return shipment_update
