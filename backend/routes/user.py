from fastapi import APIRouter, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from deps.auth import CurrentUser, get_client_ip
from deps.service import UserSvc
from schema.user_schema import (
    LoginRequest,
    LoginResponse,
)

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")  # type: ignore
async def login_post(
    data: LoginRequest,
    request: Request,
    service: UserSvc,
):
    ip = get_client_ip(request)
    return service.login(data=data, ip=ip)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    current_user: CurrentUser,
):

    return {"status": "success", "detail": "Logged out successfully"}
