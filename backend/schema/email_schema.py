from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, Field

from schema.shipment_shcema import ConsolidateResponse, TrailerResponse


class NotificationType(StrEnum):
    NOTIFACTION = "notification"
    STATUS = "status"


class BaseNotificationShipment(BaseModel):
    target_email: list[str]
    tracking_number: str
    customer_tracking: str
    type_operation: str


class PayloadAssginationNotificationEvent(BaseNotificationShipment):
    notification_type: Literal[NotificationType.NOTIFACTION] = (
        NotificationType.NOTIFACTION
    )
    tag: str
    gafet: str
    cfdi: str | None

class PayloadStatusTrailer(TrailerResponse):
    client_name:str
    target_email:list[str]
    notification_type: Literal[NotificationType.STATUS] = NotificationType.STATUS

class PayloadStatusConsolidate(ConsolidateResponse):
    client_name: str
    target_email: list[str]
    notification_type: Literal[NotificationType.STATUS] = NotificationType.STATUS

UnifyNotification = Annotated[
    PayloadAssginationNotificationEvent
    | PayloadStatusConsolidate
    | PayloadStatusTrailer,
    Field(discriminator="notification_type"),
]
