from typing import Annotated, Any

from database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session


def get_shipment_service(db: Session = Depends(get_db)):
    from utility.shipment_service import ShipmentService

    return ShipmentService(db)


def get_user_service(db: Session = Depends(get_db)):
    from utility.user_service import UserService

    return UserService(db)


def get_client_service(db: Session = Depends(get_db)):
    from utility.cliente_service import ClienteService

    return ClienteService(db)


def get_employee_service(db: Session = Depends(get_db)):
    from utility.employee_service import EmployeeService

    return EmployeeService(db)


ShipmentSvc = Annotated[
    Any, Depends(get_shipment_service)
]  # Or keep type hints using TYPE_CHECKING if needed
UserSvc = Annotated[Any, Depends(get_user_service)]
ClientSvc = Annotated[Any, Depends(get_client_service)]
EmployeeSvc = Annotated[Any, Depends(get_employee_service)]
