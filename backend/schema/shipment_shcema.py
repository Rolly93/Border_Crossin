from typing import List, Optional
from enum import Enum
from pydantic import BaseModel
from datetime import datetime


class ShipmentStats(BaseModel):
    label: str
    value: str | int
    color: str


class EventCategory(str, Enum):
    PICK_UP = "pick_up"
    DEPARTURE = "departure"
    DELAY = "delay"
    MEX_INSPECCION = "mex_inspeccion"
    CLEAR_MEX = "clear_mex"
    USA_INSPECCION = "usa_inspeccion"
    CLEAR_USA = "clear_usa"
    SAFETY_YARD = "safety_yard"
    DELIVERY = "deliver"


class ShipmentEvent(BaseModel):
    category: EventCategory
    dateTime: Optional[datetime] = None
    notes: Optional[str] = None


class ShipmentCreate(BaseModel):
    tracking_number: str
    customer_tracking: str
    cliente: str
    truck: str
    vehicle_type: str
    trailer: str
    origen: str
    destino: str
    type_operation: str


class Shipment(ShipmentCreate):
    id: int
    status: Optional[str] = "success"
    events: List[ShipmentEvent]

    class Config:
        from_attributes: True


class ShipmentUpdate(BaseModel):
    tracking_number: Optional[str] = None
    customer_tracking: Optional[str] = None
    cliente: Optional[str] = None
    truck: Optional[str] = None
    vehicle_type: Optional[str] = None
    trailer: Optional[str] = None
    origen: Optional[str] = None
    destino: Optional[str] = None
    type_operation: Optional[str] = None
    events: List[ShipmentEvent]
