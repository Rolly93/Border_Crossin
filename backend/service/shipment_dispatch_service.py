import logging
from typing import List

from sqlalchemy.orm import Session

from model.db_model import ShipmentAssign, ShipmentEventModel, SftpSend
from schema.shipment_shcema import EventCategory, EventPayload
from schema.sftp_schema import SftpConfigurationRequest
from service.sftp_sender import send_batch
from service.xml_service import XMLService

logger = logging.getLogger(__name__)


class ShipmentDispatchService:
    """Genera el XML de cada evento nuevo, registra el envío y lo transmite."""

    def __init__(
        self,
        db: Session,
        xml_svc: XMLService,
        sftp_config: SftpConfigurationRequest,
        scac: str,
    ):
        self._db = db
        self._xml_svc = xml_svc
        self._config = sftp_config
        self._scac = scac

    def dispatch_events(
        self, shipment: ShipmentAssign, events: List[ShipmentEventModel]
    ) -> List[SftpSend]:
        sends: List[SftpSend] = []

        for event in events:
            # Regla existente: solo se envían eventos con comentario.
            if event.notes is None:
                continue
            try:
                payload = EventPayload(
                    customer_tracking=shipment.customer_tracking,
                    cliente=shipment.client_id,
                    tracking_number=shipment.tracking_number,
                    type_operation=shipment.type_operation,
                    scac_code=self._scac,
                    event=EventCategory(event.category),
                    dateTime=event.event_time,
                    notes=event.notes,
                )
                file_path = self._xml_svc.create_event_file(
                    payload, self._scac, self._config.root_folder
                )
            except Exception as err:
                logger.error("No se generó el XML del evento %s: %s", event.id, err)
                continue

            send = SftpSend(
                shipment_event_id=event.id,
                filename=file_path.rsplit("/", 1)[-1].rsplit("\\", 1)[-1],
                local_path=file_path,
                status="pending",
                sent_to=self._config.id,
                retries=0,
            )
            self._db.add(send)
            sends.append(send)

        self._db.commit()
        for send in sends:
            self._db.refresh(send)

        if sends:
            send_batch(self._db, self._config, sends)
        return sends
