from fastapi import APIRouter, HTTPException, status, Depends
from utility.auth_service import AuthService
from fastapi_utils.cbv import cbv
from schema.user import LoginRequest, LoginResponse, NewUser, NewUserResponse
from schema.employee_schema import EmployeeRequest
from sqlalchemy.orm import Session
from databse import get_db

router = APIRouter(prefix="/user", tags=["user"])


@cbv(router)
class LoginRoute:

    def __init__(self, db: Session = Depends(get_db)):
        self._auth = AuthService(db)

    @router.post("/login", response_model=LoginResponse)
    async def login_post(self, data: LoginRequest):

        if not data.password:
            return HTTPException(status_code=400, detail="Datos no Proporcionados")

        result = self._auth.autenticar(data)

        return

    @router.post("/new_user", response_model=NewUserResponse)
    async def new_user(self, data: NewUser, rfc: str, admin: int = 0):

        user_exist = self._auth.user_already_exists()
        admin_user = self._auth.verify_admin(admin)

        if admin_user and user_exist:
            if not data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Please contact your IT Mananger",
                )
        new_user = self._auth.create_newuser(data, admin, rfc)

        return {    "status":"201 Created",
                    "detail":"User Created Successfully",
                    "email":data.email,
                }

    @router.post("/register_employee")
    async def register_employee(self, data: EmployeeRequest, admin: int):

        self._auth.verify_admin(admin)
        new_employee = self._auth.create_employee(data)

        return {
            "status": "201",
            "detail": "Employee registered successfully",
            "name": new_employee.name,
        }
