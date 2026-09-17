from typing import Optional

from pydantic import Field


class XmlRequest:
    client_reference: str
    operation_type: str
    scac_code: str
    drayage_reference: str
    date_time: str
    event_code: str
    comments: Optional[str | None]
