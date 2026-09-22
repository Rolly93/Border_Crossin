from fastapi import Depends
from typing import Annotated
from sqlalchemy.orm import Session
from utility.employee_service import EmployeeService
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


def get_employee_service(db: Session = Depends(get_db)) -> EmployeeService:
    return EmployeeService(db)


ShipmentSvc = Annotated[ShipmentService, Depends(get_shipment_service)]
UserSvc = Annotated[UserService, Depends(get_shipment_service)]
ClientSvc = Annotated[ClienteService, Depends(get_client_service)]
EmployeeSvc = Annotated[EmployeeService, Depends(get_employee_service)]
