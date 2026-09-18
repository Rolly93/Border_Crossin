from typing import Optional
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from enum import Enum
from datetime import datetime
from exeption import *

from backend.schema.shipment_shcema import EventPayload, EventCategory


class XmlRequest:
    customer_tracking: str
    type_operation: str
    scac_code: str
    tracking_number: str
    dateTime: str
    event_code: str
    notes: Optional[str | None]


class EventCode(str, Enum):
    AFS = "pick_up"
    DPU = "departure"
    EXR = "mex_inspeccion"
    ECC = "clear_mex"
    ILR = "usa_inspeccion"
    CLR = "clear_usa"
    ST1 = "safety_yard"
    TSC = "deliver"


class BaseXMLTransformer(ABC):
    @abstractmethod
    def transform_event(self, data: EventPayload) -> Dict[str, Any]:
        """Converts internal event data to the client's expected XML dictionary structure."""
        pass

    def format_filename(self, data: EventPayload) -> str:
        """Converts internal filename format."""
        return ""


class ExpeditorsXMLService(BaseXMLTransformer):

    def validate_reference(self, referece: str) -> str:
        if not referece.startswith("82B") or not referece.startswith("92B"):
            raise InvalidReferenceError(
                f"The Reference {referece} should start with 92B or 82B"
            )
        if len(referece) != 10:
            raise InvalidReferenceLengthError(
                f"The Reference {referece} should be 10 charactes lenght"
            )

        return referece

    def _format_datetime(self, dt: datetime) -> str:

        if not dt:
            raise InvalidEventDateTimeError("Event dateTime is required but was None.")

        return dt.strftime("%y-%m-%dT%H:%M:%S")

    def _event_code(self, event: EventCategory) -> str:
        raw_event = event.value if isinstance(event, Enum) else event
        match raw_event:
            case "pick_up":
                return EventCode.AFS.name
            case "departure":
                return EventCode.DPU.name
            case "mex_inspeccion":
                return EventCode.EXR.name
            case "clear_mex":
                return EventCode.ECC.name
            case "usa_inspeccion":
                return EventCode.ILR.name
            case "clear_usa":
                return EventCode.CLR.name
            case "safety_yard":
                return EventCode.ST1.name
            case "deliver":
                return EventCode.TSC.name
            case _:
                raise InvalidEventCodeError(
                    "Status Event Invalid according to Expeditors Standarts"
                )

    def format_filename(self, data: EventPayload, scac: str) -> str:
        now_str = datetime.now().strftime("%Y%m%dT%H%M%S")
        reference = data.customer_tracking
        eventcode = self._event_code(data.event)
        return f"{scac}_{reference}_{eventcode}_{now_str}.xml"

    def transform_event(self, data: EventPayload) -> Dict[str, Any]:
        return {
            "AvisoEventos": {
                "ReferenciaExpd": data.customer_tracking,
                "TipoOperacion": data.type_operation,
                "CodigoTransportista": data.scac_code,
                "ReferenciaTransportista": data.tracking_number,
                "CodigoEvento": self._event_code(data.event),
                "FechaHoraEvento": self._format_datetime(data.dateTime),
                "Comentarios": data.notes if data.notes else "",
            }
        }
