from fastapi import APIRouter, HTTPException, Depends
from fastapi_utils.cbv import cbv
from databse import get_db
from sqlalchemy.orm import Session
from schema import ClientModel, ClientRequest, ClientResponse
from utility.cliente_service import ClienteService

router = APIRouter(prefix="/client", tags=["client"])


@cbv(router)
class ClientRoute:
    def __init__(self, db: Session = Depends(get_db)):
        self._client_service = ClienteService(db)
