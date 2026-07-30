from datetime import datetime
from typing import List
from fastapi import APIRouter
from fastapi_utils.cbv import cbv
from model.shipment import Shipment, ShipmentCreate ,ShipmentEvent

router = APIRouter(
    prefix='/shipment',
    tags=['shipment']
)

@cbv(router)
class RShipment:
    
    @router.get('/', )
    async def shipment_dashboard(self) -> List[Shipment]:
        print("test")
        return [
            Shipment(
                id=1,
                trcking_Number="92b1234567",
                costumer_tracking="CUST-99211",
                cliente="MOGA Logistics",
                truck="TR-15",
                vehicleType="Trailer",
                trailer="TA123456",
                orgien="Bodega Mexico",
                destino="USA Distribution Center",
                type_operation="Exportacion",
                status="In Transit",
                events=[
                    ShipmentEvent(
                        category="pick_up",
                        dateTime=datetime.fromisoformat("2026-06-28T07:00:00")
                    ),
                    ShipmentEvent(
                        category="departure",
                        dateTime=datetime.fromisoformat("2026-06-28T08:15:00")
                    ),
                    ShipmentEvent(
                        category="clear_mex",
                        dateTime=datetime.fromisoformat("2026-06-29T11:00:00")
                    ),
                    ShipmentEvent(
                        category="usa_inspeccion",
                        dateTime=datetime.fromisoformat("2026-06-29T14:00:00"),
                        notes="Inspección de rayos X aprobada."
                    ),
                    ShipmentEvent(
                        category="clear_usa",
                        dateTime=datetime.fromisoformat("2026-06-29T15:30:00")
                    ),
                    ShipmentEvent(
                        category="safety_yard",
                        dateTime=datetime.fromisoformat("2026-06-29T18:00:00"),
                        notes="Resguardo nocturno."
                    ),
                    ShipmentEvent(
                        category="deliver",
                        dateTime=datetime.fromisoformat("2026-06-30T10:30:00"),
                        notes="Entregado y firmado por el receptor"
                    )
                ]
            )
        ]
    @router.post('/{id}/create')
    async def create_shipment(self, id: str, data: ShipmentCreate):
        print(f"ID: {id}, Data: {data}")
        # Returning a dictionary ensures FastAPI properly encodes it to application/json
        return {"status": "success", "id": id}