from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_utils.cbv import cbv
from schema.shipment_shcema import Shipment, ShipmentCreate, ShipmentUpdate

router = APIRouter(prefix="/shipment", tags=["shipment"])

from sqlalchemy.orm import Session
from databse import get_db
from model.shipment_model import ShipmentModel, ShipmentEventModel


@cbv(router)
class RShipment:

    @router.get("/", response_model=List[Shipment])
    async def shipment_dashboard(self, db: Session = Depends(get_db)) -> List[Shipment]:
        shipments = db.query(ShipmentModel).all()
        return shipments

    @router.post("/create")
    async def create_shipment(
        self, shipment: ShipmentCreate, db: Session = Depends(get_db)
    ):
        db_shipment = ShipmentModel(**shipment.model_dump())

        db.add(db_shipment)
        db.commit()
        db.refresh(db_shipment)

        return {"status": "success", "data": shipment}

    @router.put("/{id}/update")
    async def update_shipment(
        self, id: int, shipment_data: ShipmentUpdate, db: Session = Depends(get_db)
    ):

        db_shipment = db.query(ShipmentModel).filter(ShipmentModel.id == id).first()
        print(db_shipment, shipment_data)
        if not db_shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Shipment with id {id} not found",
            )

        update_data = shipment_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():

            if key == "events" and value is not None:
                db_shipment.events = [
                    ShipmentEventModel(**event)
                    for event in value
                    if event.get("dateTime") is not None
                ]
            else:
                setattr(db_shipment, key, value)

            db.commit()
            db.refresh(db_shipment)

        return {"status": "success", "data": db_shipment}
