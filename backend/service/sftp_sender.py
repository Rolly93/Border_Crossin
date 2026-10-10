import logging
import os
from typing import List

from sqlalchemy.orm import Session

from model.db_model import SftpSend
from schema.sftp_schema import SftpConfigurationRequest
from schema.shipment_shcema import EventCategory, EventPayload
from service.sftp_service import SFTPService
from service.xml_factory import XMLServiceFactory
from service.xml_service import XMLService

logger = logging.getLogger(__name__)

# Reintentos automáticos después del primer intento (4 intentos en total).
MAX_RETRIES = 3


def build_event_xml(send: SftpSend, scac: str, root_folder: str) -> str:
    """Genera el XML del evento del envío, reconstruyéndolo desde la base de datos."""
    event = send.shipment_event
    trip = event.trip
    payload = EventPayload(
        customer_tracking=trip.customer_tracking,
        cliente=trip.client_id,
        tracking_number=trip.tracking_number,
        type_operation=trip.type_operation,
        scac_code=scac,
        event=EventCategory(event.category),
        dateTime=event.event_time,
        notes=event.notes,
    )
    strategy = XMLServiceFactory.get_xml_service(trip.client.name)
    return XMLService(strategy).create_event_file(payload, scac, root_folder)


def send_batch(
    db: Session,
    config: SftpConfigurationRequest,
    sends: List[SftpSend],
    scac: str,
) -> None:
    """Genera el XML si falta, lo sube por una sola conexión y actualiza cada envío."""
    sftp = SFTPService(config)
    try:
        for send in sends:
            _send_one(db, sftp, send, scac, config.root_folder)
    finally:
        sftp.close()


def _send_one(
    db: Session,
    sftp: SFTPService,
    send: SftpSend,
    scac: str,
    root_folder: str,
) -> None:
    total_attempts = 1 + MAX_RETRIES
    for attempt in range(total_attempts):
        try:
            # Si el XML no existe (no se generó o falló antes), se genera de nuevo.
            if not send.local_path or not os.path.exists(send.local_path):
                send.local_path = build_event_xml(send, scac, root_folder)
                send.filename = os.path.basename(send.local_path)
                db.commit()

            if sftp.sftp is None:
                sftp.connect()
            sftp.upload_file(send.local_path)

            send.status = "sent"
            send.sftp_log = None
            db.commit()
            return
        except Exception as err:
            send.status = "failed"
            send.sftp_log = str(getattr(err, "detail", err))
            if attempt < total_attempts - 1:
                send.retries += 1
            db.commit()
            logger.warning(
                "Envío %s falló (intento %s/%s): %s",
                send.id, attempt + 1, total_attempts, send.sftp_log,
            )
            sftp.close()
