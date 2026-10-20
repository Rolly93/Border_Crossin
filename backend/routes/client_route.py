from fastapi import APIRouter, Depends, Query, status

from deps.auth import CurrentUser, get_current_user, require_admin
from deps.service import ClientSvc, ReferenceRuleSvc
from model.db_model import ClientReferenceRule
from schema import ClientRequest
from schema.client_schema import (
    ClientNameResponse,
    ClientOptionResponse,
    MetricsClientResponse,
    PaginatedClientResponse,
    ReferenceRuleOut,
)

router = APIRouter(
    prefix="/client", tags=["client"], dependencies=[Depends(get_current_user)]
)


@router.get(
    "/by-operation",
    status_code=status.HTTP_200_OK,
    response_model=list[ClientNameResponse],
)
async def clients_by_operation(
    current_user: CurrentUser,
    service: ReferenceRuleSvc,
    operation_type: str = Query(..., description="importacion | exportacion"),
):
    return service.clients_for_operation(operation_type)


@router.get(
    "/{client_id}/reference-rules",
    status_code=status.HTTP_200_OK,
    response_model=list[ReferenceRuleOut],
)
async def client_reference_rules(
    client_id: int, current_user: CurrentUser, service: ReferenceRuleSvc
) -> list[ClientReferenceRule]:
    return service.rules_for_client(client_id)


@router.get(
    "/all", status_code=status.HTTP_200_OK, response_model=list[ClientOptionResponse]
)
async def get_all_clients(
    service: ClientSvc,
    current_user: CurrentUser,
):
    return service.get_client_dropdown_options()


@router.get("/", status_code=status.HTTP_200_OK, response_model=PaginatedClientResponse)
async def client_dashboard(
    service: ClientSvc,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
) -> PaginatedClientResponse:

    return service.get_all_clients(page=page, limit=limit)


@router.get(
    "/metrics", status_code=status.HTTP_200_OK, response_model=MetricsClientResponse
)
async def get_clients(
    service: ClientSvc,
    current_user: CurrentUser,
) -> MetricsClientResponse:
    return service.get_metrics()


@router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def new_client(
    data: ClientRequest,
    service: ClientSvc,
    current_user: CurrentUser,
):
    client = service.create_client(data=data)
    return {"id": client.id, "name": client.name}


@router.put(
    "/update",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
async def update_client(
    data: ClientRequest,
    client_id: int,
    service: ClientSvc,
    current_user: CurrentUser,
):
    if not client_id:
        return
    return service.update_client_info(client_id=client_id, data=data)


@router.delete(
    "/delete/{client_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
async def delete(
    client_id: int,
    service: ClientSvc,
    current_user: CurrentUser,
):
    deleted_client = service.delete_client(client_id=client_id)
    return deleted_client


@router.put(
    "/reactive/{client_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
async def reactive(
    client_id: int,
    service: ClientSvc,
    current_user: CurrentUser,
):
    reactive_client = service.reactive_client(client_id=client_id)
    return reactive_client
