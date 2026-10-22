from enum import Enum

from fastapi import APIRouter, Query, Request, status

from deps.auth import (
    CurrentUser,
    OptionalCurrentUser,
)
from deps.service import EmployeeSvc, UserSvc
from schema import EmployeeResponseUnion
from schema.employee_schema import (
    EmployeeCreateUnion,
    EmployeeRequest,
    OperatorOption,
    PaginatedEmployeeResponse,
)

router = APIRouter(prefix="/employees", tags=["employee"])


class CargoTypeEnum(str, Enum):
    CSR = "csr"
    OPERADOR = "operador"


@router.get(
    "/",
    summary="List Employees",
    status_code=status.HTTP_200_OK,
    response_model=PaginatedEmployeeResponse,
)
async def list_employees(
    service: EmployeeSvc,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
) -> PaginatedEmployeeResponse:
    return service.get_all_employees(page=page, limit=limit)


@router.post(
    "/create",
    summary="Register Employee",
    status_code=status.HTTP_201_CREATED,
)
async def register_employee(
    rq: Request,
    data: EmployeeCreateUnion,
    service: EmployeeSvc,
    current_user: OptionalCurrentUser,
):

    ip = current_user.client_ip
    new_employee = service.register_employee_service(
        data=data, ip=ip, current_user=current_user
    )
    return new_employee


@router.get(
    "/operators",
    summary="List Operators",
    status_code=status.HTTP_200_OK,
    response_model=list[OperatorOption],
)
async def list_operators(
    service: EmployeeSvc,
    current_user: CurrentUser,
):
    return service.list_operators()


@router.post(
    "/register_driver",
    summary="Register Driver",
    status_code=status.HTTP_201_CREATED,
)
async def resgister_driver(
    rq: Request,
    data: EmployeeRequest,
    service: EmployeeSvc,
    current_user: CurrentUser,
):
    pass


@router.get(
    "/{id}",
    summary="Get Employee by ID",
    status_code=status.HTTP_200_OK,
    response_model=EmployeeResponseUnion,
)
async def get_employee_data(
    rq: Request,
    id: int,
    current_user: CurrentUser,
    service: UserSvc,
    cargoType: CargoTypeEnum = Query(  # noqa: B008
        description="Type of employee: 'csr' or 'operador'"
    ),
):

    return service.get_employee_info(id=id, cargoType=cargoType.value)
