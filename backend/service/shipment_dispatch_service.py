import logging
from typing import Any

from sqlalchemy.orm import Session

from integrations.deps.aws_dep import LambdaClientDep
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
from schema.shipment_shcema import (
    ConsolidateResponse,
    TrailerResponse,
    TypeOperation,
)

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
        config_id: int,
        unavailable_reason: str | None = None,
    ) -> list[SftpSend]:
        """Registra un envío pendiente por evento. El envío real lo hace
        `service.sftp_dispatcher.process_sends` en segundo plano.

        Con `unavailable_reason` (p. ej. la configuración no se puede descifrar) los
        envíos quedan fallidos de una vez, visibles para reenvío manual.
        """
        sends = self._sftp_repo.create(
            event=events, filename="", status="pending", config_id=config_id
        )
        if not sends:
            return sends

        reason = unavailable_reason or (None if self._scac else "Sin SCAC configurado en el sistema")
        if reason:
            # Queda visible y reenviable manualmente una vez corregido.
            self._sftp_repo.mark_failed_bulk(sends, reason)
            logger.error("%s: %s envíos marcados como failed", reason, len(sends))
        return sends
