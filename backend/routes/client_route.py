from fastapi import APIRouter, Depends, status
from deps.service import get_client_service
from deps.auth import get_current_user
from schema import ClientRequest
from utility.cliente_service import ClienteService

router = APIRouter(
    prefix="/client", tags=["client"], dependencies=[Depends(get_current_user)]
)


@router.post(
    "/new_client",
    status_code=status.HTTP_201_CREATED,
)
async def new_client(
    admin_id: int,
    data: ClientRequest,
    service: ClienteService = Depends(get_client_service),
):
    return service.register_client(data=data)


@router.patch(
    "/update_client",
    status_code=status.HTTP_200_OK,
)
async def update_client(
    admin_id: int,
    data: ClientRequest,
    service: ClienteService = Depends(get_client_service),
):
    return service.update_client_info(client_id=data.id, data=data)
