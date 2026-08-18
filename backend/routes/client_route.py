from fastapi import APIRouter, HTTPException, Depends, status
from fastapi_utils.cbv import cbv
from httpx import Client
from databse import get_db
from sqlalchemy.orm import Session
from schema import ClientRequest
from utility.cliente_service import ClienteService
from utility.user_service import UserService

router = APIRouter(prefix="/client", tags=["client"])


@cbv(router)
class ClientRoute:
    def __init__(self, db: Session = Depends(get_db)):
        self._client_service = ClienteService(db)
        self._auth = UserService(db)

    @router.post(
        "/new_client", response_model=ClientRequest, status_code=status.HTTP_201_CREATED
    )
    async def new_client(self, admin_id: int, data: ClientRequest):

        self._auth.verify_admin(admin_id)

        newclient = self._client_service.create_client(data)

        return {"status": "success", "data": newclient.name}

    @router.patch(
        "/update_client", response_model=ClientRequest, status_code=status.HTTP_200_OK
    )
    async def update_client(self, admin_id: int, data: ClientRequest):

        return data
