from fastapi import APIRouter, status

from deps.auth import CurrentUser, get_user_id
from deps.service import ShipmentSvc
from schema.shipment_shcema import (
    PaginatedShipmentResponse,
    ShipmentCreateRequest,
    ShipmentUpdate,
)

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


def _shipment_to_dict(s) -> dict:
    return {
        "id": s.id,
        "tracking_number": s.tracking_number,
        "customer_tracking": s.customer_tracking,
        "type_operation": s.type_operation,
        "origen": s.origen,
        "destination": s.destination,
        "cliente": s.client_id,
        "truck": s.truck.unit_number if s.truck else None,
        "trailer": s.trailer.plates if s.trailer else None,
        "status": "success",
        "events": [],
    }


@router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
)
async def create_shipment(
    shipment: ShipmentCreateRequest,
    current_user: CurrentUser,
    service: ShipmentSvc,
):
    created = service.create_shipment(shipment, get_user_id(current_user))
    return _shipment_to_dict(created)


@router.put("/{id}/update")
async def update_trip(
    id: int,
    shipment_data: ShipmentUpdate,
    current_user: CurrentUser,
    service: ShipmentSvc,
):
    updated = service.update_shipment(id, shipment_data, int(current_user.sub))

    return {
        "status": "success",
        "data": {
            "id": updated.id,
            "tracking_number": updated.tracking_number,
            "events_total": len(list(updated.events)),
        },
    }


@router.patch("/{id}/delete")
async def delete_shipment(
    id: int,
    current_user: CurrentUser,
    service: ShipmentSvc,
):
    shipment_deleted = service.delete_shipmnet(id, int(current_user.sub))
    return {"status": "success", "data": shipment_deleted}
