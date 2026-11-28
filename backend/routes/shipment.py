from fastapi import APIRouter, BackgroundTasks, status

from deps.auth import CurrentUser, get_user_id
from deps.service import ShipmentSvc
from schema.shipment_shcema import (
    PaginatedShipmentResponse,
    ServiceTypeUnionRequest,
    ServiceTypeUnionRequestUpdate,
    ShipmentUpdateResponse,
    UpdateShipment,
)
from service.sftp_dispatcher import process_sends

router = APIRouter(
    prefix="/shipment",
    tags=["Shipments"],
)


@router.get("/", response_model=PaginatedShipmentResponse)
async def shipment_dashboard(
    service: ShipmentSvc,
    current_user: CurrentUser,
    page: int = 1,
    limit: int = 10,
):
    return service.get_all_shipments(page=page, limit=limit)


@router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
)
async def create_shipment(
    shipment: ServiceTypeUnionRequest,
    current_user: CurrentUser,
    service: ShipmentSvc,
):
    service.create_shipment(shipment, get_user_id(current_user))


@router.put("/{id}/update")
async def update_trip(
    id: int,
    shipment_data: ServiceTypeUnionRequestUpdate,
    current_user: CurrentUser,
    service: ShipmentSvc,
    background: BackgroundTasks,
) -> ShipmentUpdateResponse:
    updated, pending_send_ids = service.update_shipment(
        id, shipment_data, int(current_user.sub)
    )
    if pending_send_ids:
        # Los XML se suben después de responder (4 intentos con espera).
        background.add_task(process_sends, pending_send_ids)

    return ShipmentUpdateResponse(
        status="success",
        data=UpdateShipment(
            id=updated.id,
            tracking_number=updated.tracking_number,
            events_total=len(list(updated.events)),
        ),
    )


@router.patch("/{id}/delete", status_code=status.HTTP_202_ACCEPTED)
async def delete_shipment(
    id: int,
    current_user: CurrentUser,
    service: ShipmentSvc,
):
    service.delete_shipmnet(id, int(current_user.sub))
