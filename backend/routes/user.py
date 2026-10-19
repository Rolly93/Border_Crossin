from fastapi import APIRouter, Request, status

from deps.auth import (
    CurrentUser,
    get_client_ip,
)
from schema.user_schema import (
    LoginRequest,
    LoginResponse,
    NewUser,
    NewUserResponse,
)
from utility.user_service import UserService

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login_post(
    data: LoginRequest,
    rq: Request,
    service: UserService,
):
    ip = get_client_ip(rq)
    return service.login(data=data, ip=ip)


@router.post(
    "/create",
    response_model=NewUserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def new_user(data: NewUser, current_user: CurrentUser, service: UserService):
    return service.register_new_user(data=data, current_user=current_user)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    current_user: CurrentUser,
):

    return {"status": "success", "detail": "Logged out successfully"}
