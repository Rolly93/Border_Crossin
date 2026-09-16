from typing import Optional, Union
from fastapi import APIRouter, Depends, Request, status

from schema.employee_schema import EmployeeRequest
from schema import TokenPayload, InitialTokenPayload
from deps.auth import get_client_ip, get_optional_current_user
from deps.service import get_user_service
from utility.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["employee"])


@router.post(
    "/create",
    summary="Register Employee",
    status_code=status.HTTP_201_CREATED,
)
async def register_employee(
    rq: Request,
    data: EmployeeRequest,
    service: EmployeeService = Depends(get_user_service),
    current_user: Optional[Union[TokenPayload, InitialTokenPayload]] = Depends(
        get_optional_current_user
    ),
):
    ip = get_client_ip(rq)
    return service.register_employee(data=data, ip=ip, current_user=current_user)
