
from fastapi import APIRouter , HTTPException
from utility.auth_service import AuthService
from fastapi_utils.cbv import cbv
from backend.model.user import LoginRequest , NewUser
from model.status import ResponseStatus
from fastapi.responses import RedirectResponse

router = APIRouter()
@cbv(router)
class LoginRoute:

    @router.post("/login")
    async def login_post(self , data:LoginRequest):

        if not data:
            return HTTPException(status_code=400 , detail="Datos no Proporcionados")

        auth = AuthService()
        result = auth.autenticar(data.email , data.password)
        print(result)
        if result:
         id = str(result.id)  
         is_admin = result.is_admin
         return{
             "status": ResponseStatus.SUCCESS,
             "user_id": id,
             "is_admin": is_admin
         }
        
        return HTTPException(status_code=ResponseStatus.ERROR , detail="Credenciales Incorrectas")
    
    @router.post("/user")
    async def new_user(self , data:NewUser):
        if not data:
            return HTTPException(status_code=400 , detail="Datos no Proporcionados")
        
        
        
        



