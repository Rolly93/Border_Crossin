from fastapi import Depends
from sqlalchemy.orm import Session
from databse import get_db
from utility.shipment_service import ShipmentService
from utility.user_service import UserService
from utility.cliente_service import ClienteService


def get_shipment_service(db: Session = Depends(get_db)) -> ShipmentService:
    return ShipmentService(db)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


def get_client_service(db: Session = Depends(get_db)) -> ClienteService:
    return ClienteService(db)
