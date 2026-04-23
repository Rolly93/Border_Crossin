    
from typing import List , Optional
from enum import Enum
from pydantic import BaseModel

class ShipmentStats(BaseModel):
    label: str
    value : str | int
    color : str


class EventCategory(str ,Enum):
    PICK_UP = "PICK UP"
    DEPARTURE = "DEPARTURE"
    DELAY = "DELAY"
    CLEAR_MEX = "CLEAR MEX"
    MEX_INSPECCION = "MEX INSPECCION"
    USA_INSPECCION = "USA INSPECCION"
    CLEAR_USA = "CLEAR USA"
    SAFETY_YARD = "SAFETY_YARD"
    DELIVERY = "DELIVERY"

class ShipmentEvent(BaseModel):
    category:EventCategory
    time:str
    date: str
    notes:Optional[str]=None
    
    
    
class Shipment(BaseModel):
    id : str
    my_reference: int
    cliente_reference:str
    cliente: str
    truck : str
    typeVehicle : str
    trailer:str
    scac:str
    origen:str
    deliverTo:str
    status:str
    events:List[ShipmentEvent]

