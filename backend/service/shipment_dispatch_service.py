import logging
from typing import Any

from sqlalchemy.orm import Session

from deps.auth import LambdaClientDep
from model.db_model import (
    SftpSend,
    ShipmentAssign,
    ShipmentEventModel,
    UnitAssignment,
    UnitTruck,
)
from repository.sftp_send_repository import Sftp_Send_Repository
from repository.system_config_repository import SystemConfigRepository
from schema.email_schema import (
    NotificationType,
    PayloadAssginationNotificationEvent,
    PayloadStatusConsolidate,
    PayloadStatusTrailer,
    UnifyNotification,
)
from schema.sftp_schema import SftpConfigurationRequest
from schema.shipment_shcema import (
    ConsolidateResponse,
    TrailerResponse,
    TypeOperation,
)
from service.sftp_sender import send_batch

logger = logging.getLogger(__name__)


class ShipmentDispatchService:
    """Registra un envío por cada evento nuevo y los transmite con reintentos."""

    def __init__(self, db: Session, aws_client: LambdaClientDep):
        from service.email import EmailNotificationDispatcher

        self._db = db
        self._email_service = EmailNotificationDispatcher(aws_client)
        self._scac = SystemConfigRepository(self._db).get_scac()
        self._sftp_repo = Sftp_Send_Repository(self._db)

    def notify_assigment(
        self,
        *,
        emails: list[str],
        data: ShipmentAssign,
        unit: UnitTruck,
        assigment: UnitAssignment,
    ):

        payload = PayloadAssginationNotificationEvent(
            target_email=emails,
            customer_tracking=data.customer_tracking,
            tracking_number=data.tracking_number,
            type_operation=TypeOperation(data.type_operation),
            tag=unit.tag_id or "ANAM2025LOTE0T0000000001",
            cfdi="N/A",
            gafet="ANAM2025LOTE0T0000000001",
            notification_type=NotificationType.NOTIFACTION,
        )
        self.dispatch_service(payload)

    def notify_status(
        self,
        *,
        emails: list[str],
        client_name: str,
        shipment_response: TrailerResponse | ConsolidateResponse,
    ) -> None:
        payload_data = shipment_response.model_dump()
        common_fields: dict[str, Any] = {
            "client_name": client_name,
            "target_email": emails,
            "notification_type": NotificationType.STATUS,
        }

        payload: UnifyNotification
        if isinstance(shipment_response, TrailerResponse):
            payload = PayloadStatusTrailer.model_validate(
                {**payload_data, **common_fields}
            )
        else:
            payload = PayloadStatusConsolidate.model_validate(
                {**payload_data, **common_fields}
            )
        self.dispatch_service(payload)

    def dispatch_service(self, data_service: UnifyNotification):

        if not data_service.notification_type:
            return

        if data_service.notification_type == NotificationType.NOTIFACTION:
            self._email_service.send_assignation(data_service)

        if data_service.notification_type == NotificationType.STATUS:
            self._email_service.send_status(data_service)

        pass

    def dispatch_events(
        self,
        events: list[ShipmentEventModel],
        sftp_config: SftpConfigurationRequest,
    ) -> list[SftpSend]:

        sends = self._sftp_repo.create(
            event=events, filename="", status="pending", sftp_config=sftp_config
        )

        if not sends:
            return sends

        if not self._scac:
            # Queda visible y reenviable manualmente una vez configurado el SCAC.
            self._sftp_repo.mark_failed_bulk(
                sends, "Sin SCAC configurado en el sistema"
            )
            logger.error("Sin SCAC: %s envíos marcados como failed", len(sends))
            return sends

        send_batch(self._db, sftp_config, sends, self._scac)
        return sends
