from typing import Optional
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from enum import Enum

from backend.schema.shipment_shcema import EventPayload

class XmlRequest:
    customer_tracking: str
    type_operation: str
    scac_code: str
    tracking_number: str
    dateTime: str
    event_code: str
    notes: Optional[str | None]


class BaseXMLTransformer(ABC):
    @abstractmethod
    def transform_event(self, data: EventPayload) -> Dict[str, Any]:
        """Converts internal event data to the client's expected XML dictionary structure."""
        pass


class ExpeditorsXMLService(BaseXMLTransformer):

    def transform_event(self, data: EventPayload) -> Dict[str, Any]:
        return {
            "AvisoEventos": {
                "ReferenciaExpd": data.customer_tracking,
                "TipoOperacion": data.type_operation,
                "CodigoTransportista": data.scac_code,
                "ReferenciaTransportista": data.tracking_number,
                "CodigoEvento": data.event,
                "FechaHoraEvento": data.dateTime,
                "Comentarios": data.notes if data.notes else "",
            }
        }


class EventCode(str, Enum):
    AFS = "pick_up"
    DPU = "departure"
    EXR = "mex_inspeccion"
    ECC = "clear_mex"
    ILR = "usa_inspeccion"
    CLR = "clear_usa"
    ST1 = "safety_yard"
    TSC = "deliver"
