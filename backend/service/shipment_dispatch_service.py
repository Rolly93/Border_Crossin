import logging

from sqlalchemy.orm import Session

from model.db_model import SftpSend, ShipmentEventModel
from schema.sftp_schema import SftpConfigurationRequest
from service.sftp_sender import send_batch

logger = logging.getLogger(__name__)


class ShipmentDispatchService:
    """Registra un envío por cada evento nuevo y los transmite con reintentos."""

    def __init__(
        self,
        db: Session,
        sftp_config: SftpConfigurationRequest,
        scac: str | None,
    ):
        self._db = db
        self._config = sftp_config
        self._scac = scac

    def dispatch_events(self, events: list[ShipmentEventModel]) -> list[SftpSend]:
        sends: list[SftpSend] = []
        for event in events:
            # Regla existente: solo se envían eventos con comentario.
            if event.notes is None:
                continue
            send = SftpSend(
                shipment_event_id=event.id,
                filename="",
                local_path="",
                status="pending",
                sent_to=self._config.id,
                retries=0,
            )
            self._db.add(send)
            sends.append(send)

        self._db.commit()
        for send in sends:
            self._db.refresh(send)

        if not sends:
            return sends

        if not self._scac:
            # Queda visible y reenviable manualmente una vez configurado el SCAC.
            for send in sends:
                send.status = "failed"
                send.sftp_log = "Sin SCAC configurado en el sistema"
            self._db.commit()
            logger.error("Sin SCAC: %s envíos marcados como failed", len(sends))
            return sends

        send_batch(self._db, self._config, sends, self._scac)
        return sends
