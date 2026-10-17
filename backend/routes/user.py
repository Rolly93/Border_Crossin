from typing import Optional, Union

from fastapi import APIRouter, Depends, Request, status

from deps.auth import (
    get_client_ip,
    get_current_user,
    get_optional_current_user,
)
from deps.service import get_user_service
from schema import InitialTokenPayload, TokenPayload
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
    service: UserService = Depends(get_user_service),
):
    ip = get_client_ip(rq)
    return service.login(data=data, ip=ip)


@router.post(
    "/create",
    response_model=NewUserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def new_user(
    data: NewUser,
    service: UserService = Depends(get_user_service),
    current_user: TokenPayload | InitialTokenPayload | None = Depends(
        get_optional_current_user
    ),
):
    return service.register_new_user(data=data, current_user=current_user)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    current_user: TokenPayload = Depends(get_current_user),
):

    return {"status": "success", "detail": "Logged out successfully"}
