from fastapi import APIRouter, HTTPException, status
from utility.auth_service import AuthService
from fastapi_utils.cbv import cbv
from schema.user import LoginRequest, LoginResponse, NewUser, NewUserResponse
from schema.employee_schema import EmployeeRequest

router = APIRouter(prefix="/user", tags=["user"])


@cbv(router)
class LoginRoute:

    def __init__(self):
        self._auth = AuthService()

    @router.post("/login", response_model=LoginResponse)
    async def login_post(self, data: LoginRequest):

        if not data.password:
            return HTTPException(status_code=400, detail="Datos no Proporcionados")

        result = self._auth.autenticar(data.email, data.password)
        if not result:
            return HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales Incorrectas",
            )

        return LoginResponse(
            status=result.status,
            id=result.id,
            email=result.email,
            is_admin=result.is_admin,
        )

    @router.post("/new_user", response_model=NewUserResponse)
    async def new_user(self, data: NewUser, is_admin_user: bool = False):

        user_exist = self._auth.user_already_exists()

        if not is_admin_user and user_exist:
            if not data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Please contact your IT Mananger",
                )

        return NewUserResponse(
            status="201 Created",
            detail="User Created Successfully",
            email=data.email,
        )

    @router.post("/register_employee")
    async def register_employee(self, data: EmployeeRequest, admin: int):

        self._auth.verify_admin(admin)

        return {"status": "201", "detail": "Employee registered successfully"}
