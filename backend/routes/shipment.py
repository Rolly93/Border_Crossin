from typing import List
from fastapi import APIRouter, status, HTTPException
from schema.shipment_shcema import ShipmentCreate, ShipmentUpdate, ShipmentResponse
from deps.auth import CurrentUser
from deps.service import ShipmentSvc

router = APIRouter(
    prefix="/shipment",
    tags=["Shipments"],
)


@router.get("/", response_model=List[ShipmentResponse])
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
    shipment: ShipmentCreate,
    current_user: CurrentUser,
    service: ShipmentSvc,
):
    created = service.create_shipment(shipment)
    return {"status": "success", "data": created}


@router.put("/{id}/update")
async def update_shipment(
    id: int,
    shipment_data: ShipmentUpdate,
    current_user: CurrentUser,
    service: ShipmentSvc,
):
    updated = service.update_shipment(id, shipment_data)

    return {"status": "success", "data": updated}


@router.patch("/{id}/delete")
async def delete_shipment(
    id: int,
    current_user: CurrentUser,
    service: ShipmentSvc,
):
    shipment_deleted = service.delete_shipmnet(id, current_user.sub)
    return {"status": "success", "data": shipment_deleted}
