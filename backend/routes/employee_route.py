from typing import List, Optional, Union

from deps.auth import (
    CurrentUser,
    get_client_ip,
    get_current_user,
    get_optional_current_user,
)
from deps.service import EmployeeSvc, get_user_service
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from schema import EmployeeResponseUnion, InitialTokenPayload, TokenPayload
from schema.employee_schema import (
    EmployeeBaseRequest,
    EmployeeRequest,
    EmployeeUserRequest,
    OperatorOption,
    PaginatedEmployeeResponse,
)
from utility.employee_service import EmployeeService
from utility.user_service import UserService

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
    data: EmployeeBaseRequest,
    service: EmployeeSvc,
    current_user: Optional[Union[TokenPayload, InitialTokenPayload]] = Depends(
        get_optional_current_user
    ),
):
    ip = get_client_ip(rq)
    new_employee = service.register_employee_service(
        data=data, ip=ip, current_user=current_user
    )
    return new_employee


@router.get(
    "/operators",
    summary="List Operators",
    status_code=status.HTTP_200_OK,
    response_model=List[OperatorOption],
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
    service: EmployeeService = Depends(get_user_service),
    current_user: TokenPayload = Depends(get_current_user),
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
    cargoType: str = Query(..., description="Type of employee: 'csr' or 'operador'"),
    service: UserService = Depends(get_user_service),
    current_user: TokenPayload = Depends(get_current_user),
):
    if cargoType not in {"csr", "operador"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid cargoType. Must be 'csr' or 'operador'.",
        )
    return service.get_employee_info(id=id, cargoType=str(cargoType))
