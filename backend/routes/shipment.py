from typing import List
from fastapi import APIRouter, Depends
from fastapi_utils.cbv import cbv
from schema.shipment_shcema import Shipment, ShipmentCreate, ShipmentUpdate
from sqlalchemy.orm import Session
from databse import get_db
from utility.shipment_service import ShipmentService

router = APIRouter(prefix="/shipment", tags=["shipment"])


@cbv(router)
class RShipment:

    def __init__(self, db: Session = Depends(get_db)):
        self._service = ShipmentService(db)

    @router.get("/", response_model=List[Shipment])
    async def shipment_dashboard(self):
        return self._service.get_all_shipments()

    @router.post("/create")
    async def create_shipment(self, shipment: ShipmentCreate):
        created = self._service.create_shipment(shipment)
        return {"status": "success", "data": created}

    @router.put("/{id}/update")
    async def update_shipment(self, id: int, shipment_data: ShipmentUpdate):
        updated = self._service.update_shipment(id, shipment_data)
        return {"status": "success", "data": updated}
