"""Envío SFTP de salida (solo sube XML; nunca lee ni descarga archivos).

Cada envío tiene hasta MAX_ATTEMPTS intentos automáticos, en rondas: una conexión por
ronda, se suben todos los pendientes y los que fallan esperan RETRY_DELAYS antes de la
siguiente ronda. Mientras quedan intentos el envío sigue "pending"; tras el último
queda "failed" para reenviarlo manualmente desde el frontend.
"""

import logging
import os
import time
from collections.abc import Callable

from sqlalchemy.orm import Session

from model.db_model import SftpSend
from repository.sftp_send_repository import Sftp_Send_Repository
from schema.sftp_schema import SftpConfigurationRequest
from schema.shipment_shcema import EventCategory, EventPayload
from service.sftp_service import SFTPService
from service.xml_factory import XMLServiceFactory
from service.xml_service import XMLService

logger = logging.getLogger(__name__)

MAX_ATTEMPTS = 4
# Espera (segundos) antes del intento 2, 3 y 4.
RETRY_DELAYS: tuple[int, ...] = (10, 30, 60)


def build_event_xml(send: SftpSend, scac: str, root_folder: str) -> str:
    """Genera el XML del evento del envío, reconstruyéndolo desde la base de datos."""
    event = send.shipment_event
    if not event.event_time:
        raise ValueError(f"El evento {event.id} no tiene fecha/hora")
    trip = event.trip
    payload = EventPayload(
        customer_tracking=trip.customer_tracking,
        cliente=trip.client.name,
        truck="",
        trailer="",
        vehicle_type=trip.service_type,
        tracking_number=trip.tracking_number,
        type_operation=trip.type_operation,
        origen=trip.origen,
        destination=trip.destination,
        scac_code=scac,
        event=EventCategory(event.category),
        dateTime=event.event_time,
        notes=event.notes,
    )
    strategy = XMLServiceFactory.get_xml_service(trip.client.name)
    return XMLService(strategy).create_event_file(payload, scac, root_folder)


def _error_text(err: Exception) -> str:
    return str(getattr(err, "detail", None) or err) or type(err).__name__


def _attempt_round(
    repo: Sftp_Send_Repository,
    config: SftpConfigurationRequest,
    sends: list[SftpSend],
    scac: str,
    final: bool,
) -> list[SftpSend]:
    """Un intento para cada envío con una sola conexión. Devuelve los que fallaron."""

    def fail(send: SftpSend, message: str) -> None:
        (repo.mark_failed if final else repo.mark_retry)(send, message)

    sftp = SFTPService(config)
    try:
        try:
            sftp.connect()
        except Exception as err:
            message = _error_text(err)
            for send in sends:
                fail(send, message)
            return list(sends)

        failed: list[SftpSend] = []
        for send in sends:
            try:
                # Si el XML no existe (no se generó o se borró), se genera de nuevo.
                if not send.local_path or not os.path.isfile(send.local_path):
                    local_path = build_event_xml(send, scac, config.root_folder)
                    repo.save_generated_xml(send, local_path, os.path.basename(local_path))
                sftp.upload_file(send.local_path)
                repo.mark_sent(send)
            except Exception as err:
                fail(send, _error_text(err))
                failed.append(send)
        return failed
    finally:
        sftp.close()


def send_with_retries(
    db: Session,
    config: SftpConfigurationRequest,
    sends: list[SftpSend],
    scac: str,
    delays: tuple[int, ...] = RETRY_DELAYS,
    sleep: Callable[[float], None] = time.sleep,
) -> list[SftpSend]:
    """Hasta MAX_ATTEMPTS intentos con espera entre rondas. Devuelve los que quedaron fallidos."""
    repo = Sftp_Send_Repository(db)
    remaining = list(sends)
    for attempt in range(1, MAX_ATTEMPTS + 1):
        remaining = _attempt_round(repo, config, remaining, scac, final=attempt == MAX_ATTEMPTS)
        if not remaining:
            break
        logger.warning(
            "SFTP %s: %s envío(s) fallaron en el intento %s/%s",
            config.id, len(remaining), attempt, MAX_ATTEMPTS,
        )
        if attempt < MAX_ATTEMPTS:
            sleep(delays[attempt - 1])
    return remaining


def send_once(
    db: Session,
    config: SftpConfigurationRequest,
    sends: list[SftpSend],
    scac: str,
) -> list[SftpSend]:
    """Reenvío manual: un intento inmediato (sin esperas). Devuelve los fallidos."""
    return _attempt_round(Sftp_Send_Repository(db), config, sends, scac, final=True)
