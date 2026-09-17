from typing import Optional

from pydantic import Field
from enum import Enum


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
