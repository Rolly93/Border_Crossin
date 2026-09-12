from fastapi import APIRouter, Depends, HTTPException, status
from utility.user_service import UserService
from fastapi_utils.cbv import cbv
from schema.user_schema import (
    LoginRequest,
    LoginResponse,
    NewUser,
    NewUserResponse,
)
from schema.employee_schema import EmployeeRequest
from sqlalchemy.orm import Session
from databse import get_db
from deps.auth import get_current_user
from service.jwt_service import JWTService
from schema import TokenPayload

router = APIRouter(prefix="/user", tags=["user"])


@cbv(router)
class LoginRoute:

    def __init__(self, db: Session = Depends(get_db)):
        self._auth = UserService(db)
        self.jwt = JWTService()

    @router.post("/login", response_model=LoginResponse)
    async def login_post(self, data: LoginRequest):

        userData = self._auth.autenticar(data)

        token = self.jwt.create_access_token(
            user_id=userData.id, extra_data={"is_admin": userData.is_admin}
        )

        return {
            "status": "200 Success",
            "detail": "Login Success",
            "access_token": token,
            "token_type": "bearer",
        }

    @router.post("/new_user", response_model=NewUserResponse)
    async def new_user(
        self,
        data: NewUser,
        rfc: str,
        current_user: TokenPayload = Depends(get_current_user),
    ):

        user_exist = self._auth.user_already_exists()

        if user_exist and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can create new users",
            )

        new_user = self._auth.create_newuser(data, rfc=rfc, is_bootstrap=not user_exist)

        return {
            "status": "201 Created",
            "detail": "User Created Successfully",
            "email": new_user.email,
        }

    @router.post("/register_employee")
    async def register_employee(
        self, data: EmployeeRequest, current_user: dict = Depends(get_current_user)
    ):

        new_employee = self._auth.create_employee(data)

        return {
            "status": "201",
            "detail": "Employee registered successfully",
            "name": new_employee.name,
        }
