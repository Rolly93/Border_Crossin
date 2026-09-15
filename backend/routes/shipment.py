from typing import List
from fastapi import APIRouter, Depends, status
from schema.shipment_shcema import Shipment, ShipmentCreate, ShipmentUpdate
from deps.auth import get_current_user
from deps.service import get_shipment_service
from utility.shipment_service import ShipmentService

router = APIRouter(
    prefix="/shipment",
    tags=["Shipments"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=List[Shipment])
async def shipment_dashboard(
    page: int = 1,
    limit: int = 10,
    service: ShipmentService = Depends(get_shipment_service),
):
    return service.get_all_shipments(page=page, limit=limit)


@router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
)
async def create_shipment(
    shipment: ShipmentCreate, service: ShipmentService = Depends(get_shipment_service)
):
    created = service.create_shipment(shipment)
    return {"status": "success", "data": created}


@router.put("/{id}/update")
async def update_shipment(
    id: int,
    shipment_data: ShipmentUpdate,
    service: ShipmentService = Depends(get_shipment_service),
):
    updated = service.update_shipment(id, shipment_data)
    return {"status": "success", "data": updated}
