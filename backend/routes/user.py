from typing import Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status, Request
from utility.user_service import UserService
from fastapi_utils.cbv import cbv
from schema.user_schema import (
    LoginRequest,
    LoginResponse,
    NewUser,
    NewUserResponse,
)
from sqlalchemy.orm import Session
from databse import get_db
from deps.auth import get_optional_current_user, get_client_ip
from service.jwt_service import JWTService
from schema import TokenPayload, InitialTokenPayload

router = APIRouter(prefix="/user", tags=["user"])


@cbv(router)
class LoginRoute:

    def __init__(self, db: Session = Depends(get_db)):
        self._auth = UserService(db)
        self.jwt = JWTService()

    @router.post("/login", response_model=LoginResponse)
    async def login_post(self, data: LoginRequest, rq: Request):

        userData = self._auth.autenticar(data)
        ip = get_client_ip(rq)
        token = self.jwt.create_access_token(
            ip, user_id=userData.id, extra_data={"is_admin": userData.is_admin}
        )

        return {
            "status": "200 Success",
            "detail": "Login Success",
            "access_token": token,
            "token_type": "bearer",
            "isAdmin": userData.is_admin,
        }

    @router.post("/create", response_model=NewUserResponse)
    async def new_user(
        self,
        data: NewUser,
        rfc: Optional[str] = None,
        current_user: Union[TokenPayload, InitialTokenPayload] = Depends(
            get_optional_current_user
        ),
    ):

        user_exist = self._auth.user_already_exists()

        is_admin = getattr(current_user, "is_admin", False)

        if user_exist and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can create new users",
            )

        target_rfc = current_user.sub if not user_exist else rfc

        if not target_rfc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RFC parameter is required for non-bootstrap user creation.",
            )

        created_user = self._auth.create_newuser(
            data, rfc=target_rfc, is_bootstrap=not user_exist
        )

        return {
            "status": "201 Created",
            "detail": "User Created Successfully",
            "email": created_user.email,
        }
