from datetime import datetime
from enum import Enum, StrEnum
from typing import Annotated, Self

from pydantic import AliasChoices, BaseModel, BeforeValidator, ConfigDict, Field

toUppercase = Annotated[
    str, BeforeValidator(lambda v: v.upper().strip() if isinstance(v, str) else v)
]
toCapitalCase = Annotated[
    str, BeforeValidator(lambda v: v.strip().capitalize() if isinstance(v, str) else v)
]


class TypeOperation(StrEnum):
    SOUTHBOUND = "southbound"
    NORTHBOUND = "northbound"


class ServiceType(StrEnum):
    TRAILER = "trailer"
    UNIT_TRUCK = "unit_truck"


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

    model_config = ConfigDict(from_attributes=True)


class ConsolidateRequest(BaseModel):
    service_type: ServiceType = Field(
        min_length=2, max_length=50, default=ServiceType.UNIT_TRUCK
    )
    client_id: int = Field(gt=0)
    guide_number: str = Field(min_length=3, max_length=100)
    pices: int = Field(gt=0)
    weight: float = Field(gt=0)


class ConsolidateResponse(ConsolidateRequest):
    id: int


class TrailerRequest(BaseModel):
    service_type: ServiceType = Field(
        min_length=2, max_length=50, default=ServiceType.TRAILER
    )
    trailer_number: str = Field(min_length=2, max_length=50)
    plates: str = Field(min_length=2, max_length=30)
    state: str = Field(min_length=1, max_length=10, default="N/A")
    seal: str = Field(min_length=2, max_length=50)


class TRailerResponse(TrailerRequest):
    id: int


ServiceTypeUnionRequest = Annotated[
    ConsolidateRequest | TrailerRequest | None, Field(discriminator="service_type")
]


class ShipmentCreateRequest(BaseModel):
    """Cuerpo de POST /shipment/create. Lo que manda el formulario de embarque."""

    tracking_number: toUppercase = Field(min_length=1, max_length=100)
    customer_tracking: toUppercase = Field(min_length=1, max_length=100)
    type_operation: TypeOperation = Field(default=TypeOperation.NORTHBOUND)
    cliente: int = Field(gt=0, description="ID del cliente")
    origen: str = Field(min_length=1, max_length=200)
    destination: str = Field(
        min_length=1,
        max_length=200,
        validation_alias=AliasChoices("destination", "destino"),
    )
    truck: str = Field(min_length=1, max_length=20, description="Operador ID")
    service_shipment: ServiceTypeUnionRequest


class ShipmentResponse(ShipmentCreateRequest):
    id: int
    events: list[ShipmentEvent] | None


class PaginatedShipmentResponse(BaseModel):
    data: list[ShipmentResponse]
    totalRecords: int
    hasNextPage: bool
    page: int
    limit: int


class ShipmentUpdate(ShipmentResponse): ...


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
            if e is not None
        ]
