from fastapi import APIRouter, HTTPException
from utility.auth_service import AuthService
from fastapi_utils.cbv import cbv
from model.user import LoginRequest, LoginResponse, NewUser
from model.status import ResponseStatus

router = APIRouter(prefix="/user", tags=["user"])


@cbv(router)
class LoginRoute:

    @router.post("/login", response_model=LoginResponse)
    async def login_post(self, data: LoginRequest) -> LoginResponse:

        if not data:
            return HTTPException(status_code=400, detail="Datos no Proporcionados")

        auth = AuthService()
        result = auth.autenticar(data.email, data.password)
        if result:
            id = str(result.id)
            is_admin = result.is_admin
            return LoginResponse(
                status=ResponseStatus.SUCCESS, user_id=id, is_admin=is_admin
            )

        return HTTPException(
            status_code=ResponseStatus.ERROR, detail="Credenciales Incorrectas"
        )

    @router.post("/")
    async def new_user(self, data: NewUser):
        if not data:
            return HTTPException(status_code=400, detail="Datos no Proporcionados")
