from datetime import datetime
from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, Field


class NotificationType(StrEnum):
    NOTIFACTION = "notification"
    STATUS = "status"


class BaseNotificationShipment(BaseModel):
    target_email: list[str]
    tracking_reference: str
    reference_client: str
    tipo_operacion: str


class PayloadAssginationNotificationEvent(BaseNotificationShipment):
    notification_type: Literal[NotificationType.NOTIFACTION] = (
        NotificationType.NOTIFACTION
    )
    tag: str
    gafet: str
    cfdi: str | None


class PayloadStatusNotification(BaseNotificationShipment):
    notification_type: Literal[NotificationType.STATUS] = NotificationType.STATUS
    status: str
    dateTime: datetime


UnifyNotification = Annotated[
    PayloadAssginationNotificationEvent | PayloadStatusNotification,
    Field(discriminator="notification_type"),
]
