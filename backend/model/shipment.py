    
from typing import List , Optional
from enum import Enum
from pydantic import BaseModel
from datetime import datetime

class ShipmentStats(BaseModel):
    label: str
    value : str | int
    color : str


class EventCategory(str ,Enum):
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
    category:EventCategory
    dateTime: datetime
    notes:Optional[str]=None
    
    
    
class Shipment(BaseModel):
    id : int
    trcking_Number: str
    costumer_tracking:str
    cliente: str
    truck : str
    vehicleType : str
    trailer:str
    orgien:str
    destino:str
    type_operation:str
    status:str
    events:List[ShipmentEvent]
    
class ShipmentCreate(BaseModel):
    tracking_number : str
    costumer_tracking:str
    cliente:str
    truck:str
    vehicle_type:str
    trailer:str
    origen:str
    destino:str
    type_operation:str
