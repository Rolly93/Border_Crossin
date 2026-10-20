from typing import Annotated, Literal, Self
from enum import Enum
from pydantic import AliasChoices, BaseModel, ConfigDict, BeforeValidator, Field
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
    notes: str | None

    class Config:
        from_attributes: Literal[True]
        model_config = ConfigDict(from_attributes=True)


class ShipmentBase(BaseModel):
    tracking_number: str
    customer_tracking: str
    type_operation: str
    origen: str
    destination: str

    cliente: str | None
    truck: str | None
    trailer: str | None
    vehicle_type: str | None


class ShipmentCreate(ShipmentBase):
    pass


class ShipmentCreateRequest(BaseModel):
    """Cuerpo de POST /shipment/create. Lo que manda el formulario de embarque."""

    tracking_number: toUppercase = Field(min_length=1, max_length=100)
    customer_tracking: toUppercase = Field(min_length=1, max_length=100)
    type_operation: str = Field(min_length=1, max_length=50)
    cliente: int = Field(gt=0, description="ID del cliente")
    origen: str = Field(min_length=1, max_length=200)
    placas: toUppercase = Field(
        min_length=1, max_length=50, description="Numero de placas"
    )
    # El formulario manda `destino`; se acepta también `destination`.
    destination: str = Field(
        min_length=1,
        max_length=200,
        validation_alias=AliasChoices("destination", "destino"),
    )
    truck: str = Field(min_length=1, max_length=20, description="Número de unidad")
    trailer: toUppercase = Field(
        min_length=1, max_length=50, description="number de caja"
    )


class ShipmentResponse(ShipmentCreate):
    id: int
    status: str | None = "success"
    events: list[ShipmentEvent]

    class Config:
        from_attributes: Literal[True]
        model_config = ConfigDict(from_attributes=True)


class ShipmentUpdate(BaseModel):
    tracking_number: str | None = None
    customer_tracking: str | None
    cliente: int
    truck: str | None
    vehicle_type: str | None
    trailer: str | None
    origen: str | None
    destination: str | None
    type_operation: str | None
    events: list[ShipmentEvent] | ShipmentEvent


class PaginatedShipmentResponse(BaseModel):
    data: list[ShipmentResponse]
    totalRecords: int
    hasNextPage: bool
    page: int
    limit: int


class EventPayload(BaseModel):
    tracking_number: toUppercase | None
    customer_tracking: toUppercase | None
    cliente: int
    truck: toUppercase | None
    vehicle_type: toUppercase | None
    trailer: toUppercase | None
    origen: toUppercase | None
    scac_code: toCapitalCase
    destination: toUppercase | None
    type_operation: toUppercase | None
    event: EventCategory
    dateTime: datetime
    notes: str | None

    @classmethod
    def from_shipment_update(cls, shipment_data: ShipmentUpdate) -> list[Self]:
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
