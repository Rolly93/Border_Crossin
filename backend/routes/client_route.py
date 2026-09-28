from fastapi import APIRouter, Depends, Query, status
from schema.client_schema import (
    MetricsClientResponse,
    PaginatedClientResponse,
)
from deps.service import ClientSvc, get_client_service
from deps.auth import CurrentUser, get_current_user
from schema import ClientRequest
from utility.cliente_service import ClienteService

router = APIRouter(
    prefix="/client", tags=["client"], dependencies=[Depends(get_current_user)]
)


@router.get("/", status_code=status.HTTP_200_OK, response_model=PaginatedClientResponse)
async def client_dashboard(
    service: ClientSvc,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
) -> PaginatedClientResponse:
    paginate = service.get_all_clients(page=page, limit=limit)
    print(paginate)
    return paginate


@router.get(
    "/metrics", status_code=status.HTTP_200_OK, response_model=MetricsClientResponse
)
async def get_clients(
    service: ClientSvc,
    current_user: CurrentUser,
):
    metrics = service.get_metrics()
    return metrics


@router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
)
async def new_client(
    data: ClientRequest,
    service: ClienteService = Depends(get_client_service),
):
    return service.register_client(data=data)


@router.patch(
    "/update",
    status_code=status.HTTP_200_OK,
)
async def update_client(
    data: ClientRequest,
    service: ClienteService = Depends(get_client_service),
):
    if not data.id:
        return
    return service.update_client_info(client_id=data.id, data=data)
