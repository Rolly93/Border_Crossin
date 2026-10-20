from collections.abc import Callable
from typing import Annotated, Protocol, TypeVar

from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from repository.system_config_repository import SystemConfigRepository
from utility.cliente_service import ClienteService
from utility.employee_service import EmployeeService
from utility.reference_rule_service import ReferenceRuleService
from utility.sftp_config_service import SftpConfigService
from utility.sftp_send_service import SftpSendService
from utility.shipment_service import ShipmentService
from utility.unit_service import UnitService
from utility.user_service import UserService

database = ()
DBSession = Annotated[Session, Depends(dependency=get_db)]


class ServiceProtocol(Protocol):
    def __init__(self, db: DBSession) -> None: ...


T = TypeVar("T", bound=ServiceProtocol)


def get_service(service_class: type[T]) -> Callable[[DBSession], T]:
    """A single generic factory that replaces all individual get_*_service functions."""

    def _dependency(db: DBSession) -> T:
        return service_class(db=db)

    return _dependency


ShipmentSvc = Annotated[
    ShipmentService, Depends(dependency=get_service(service_class=ShipmentService))
]
UserSvc = Annotated[
    UserService, Depends(dependency=get_service(service_class=UserService))
]
ClientSvc = Annotated[
    ClienteService, Depends(dependency=get_service(service_class=ClienteService))
]
EmployeeSvc = Annotated[
    EmployeeService, Depends(dependency=get_service(service_class=EmployeeService))
]
SftpServiceConfigSvc = Annotated[
    SftpConfigService, Depends(get_service(SftpConfigService))
]
UnitSvc = Annotated[
    UnitService, Depends(dependency=get_service(service_class=UnitService))
]
SftpServiceSend = Annotated[SftpSendService, Depends(get_service(SftpSendService))]

SystemConfigService = Annotated[
    SystemConfigRepository, Depends(get_service(SystemConfigRepository))
]
ReferenceRuleSvc = Annotated[
    ReferenceRuleService, Depends(get_service(ReferenceRuleService))
]
