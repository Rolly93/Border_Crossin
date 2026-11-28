from fastapi import APIRouter, Query, Request, status

from deps.auth import (
    CurrentUser,
    OptionalCurrentUser,
    get_client_ip,
    get_user_id,
)
from deps.service import EmployeeSvc
from schema import EmployeeResponseUnion
from schema.cargo_schema import CargoTypeEnum
from schema.employee_schema import (
    EmployeeCreateUnion,
    EmployeeRequestDash,
    OperatorOptionResponse,
    PaginatedEmployeeResponse,
)

router = APIRouter(prefix="/employees", tags=["employee"])


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
) -> EmployeeRequestDash:
    # Sin sesión solo se permite el alta inicial del administrador (lo decide el servicio).
    return service.register_employee_service(
        data=data,
        ip=get_client_ip(rq),
        current_user=current_user,
        created_by_id=get_user_id(current_user) if current_user else None,
    )


@router.get(
    "/operators",
    summary="List Operators",
    status_code=status.HTTP_200_OK,
    response_model=list[OperatorOptionResponse],
)
async def list_operators(
    service: EmployeeSvc,
    current_user: CurrentUser,
) -> list[OperatorOptionResponse]:
    return service.list_operators()


@router.get(
    "/{id}",
    summary="Get Employee by ID",
    status_code=status.HTTP_200_OK,
    response_model=EmployeeResponseUnion,
)
async def get_employee_data(
    id: int,
    current_user: CurrentUser,
    service: EmployeeSvc,
    cargoType: CargoTypeEnum = Query(  # noqa: B008
        description="Type of employee: 'csr' or 'operador'"
    ),
) -> EmployeeResponseUnion:
    return service.get_employee_info(id=id, cargoType=cargoType.value)
