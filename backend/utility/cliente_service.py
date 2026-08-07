from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from model.shipment_model import ShipmentModel, ShipmentEventModel
from schema.shipment_shcema import ShipmentCreate, ShipmentUpdate


class ClienteService:
    def __init__(self, db: Session):
        self.db = db
