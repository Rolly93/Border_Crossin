from typing import Annotated, List, Optional, Literal, Self
from enum import Enum
from pydantic import BaseModel, ConfigDict, BeforeValidator
from datetime import datetime

toUppercase = Annotated[
    str, BeforeValidator(lambda v: v.upper().strip() if isinstance(v, str) else v)
]
toCapitalCase = Annotated[
    str, BeforeValidator(lambda v: v.strip().capitalize() if isinstance(v, str) else v)
]


class ShipmentStats(BaseModel):
    label: str
    value: int
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
    dateTime: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes: Literal[True]
        model_config = ConfigDict(from_attributes=True)


class ShipmentBase(BaseModel):
    tracking_number: str
    customer_tracking: str
    type_operation: str
    origen: str
    destination: str

    cliente: Optional[str] = None
    truck: Optional[str] = None
    trailer: Optional[str] = None
    vehicle_type: Optional[str] = None


class ShipmentCreate(ShipmentBase):
    pass


class ShipmentResponse(ShipmentCreate):
    id: int
    status: Optional[str] = "success"
    events: List[ShipmentEvent]

    class Config:
        from_attributes: Literal[True]
        model_config = ConfigDict(from_attributes=True)


class ShipmentUpdate(BaseModel):
    tracking_number: Optional[str] = None
    customer_tracking: Optional[str] = None
    cliente: int
    truck: Optional[str] = None
    vehicle_type: Optional[str] = None
    trailer: Optional[str] = None
    origen: Optional[str] = None
    destination: Optional[str] = None
    type_operation: Optional[str] = None
    events: List[ShipmentEvent] | ShipmentEvent


class EventPayload(BaseModel):
    tracking_number: Optional[toUppercase] = None
    customer_tracking: Optional[toUppercase] = None
    cliente: int
    truck: Optional[toUppercase] = None
    vehicle_type: Optional[toUppercase] = None
    trailer: Optional[toUppercase] = None
    origen: Optional[toUppercase] = None
    scac_code: toCapitalCase
    destination: Optional[toUppercase] = None
    type_operation: Optional[toUppercase] = None
    event: EventCategory
    dateTime: datetime
    notes: Optional[str]

    @classmethod
    def from_shipment_update(cls, shipment_data: ShipmentUpdate) -> List[Self]:
        events_list = (
            shipment_data.events
            if isinstance(shipment_data.events, list)
            else [shipment_data.events]
        )

        shipment_meta = shipment_data.model_dump(exclude={"events"})

        return [
            cls(
                **shipment_meta,
                event=e.category,
                dateTime=e.dateTime,
                notes=e.notes,
            )
            for e in events_list
            if e.notes is not None
        ]
