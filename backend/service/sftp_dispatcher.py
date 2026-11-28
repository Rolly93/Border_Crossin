"""Envío SFTP en segundo plano (fuera de la petición que guarda el embarque).

La actualización del embarque solo crea los registros `sftp_send` (pending) y agenda
`process_sends`. Aquí se hacen los 4 intentos con espera, se alerta a soporte si al
final fallan y se avisa al frontend por /events/stream.
"""

import logging
from collections import defaultdict
from datetime import timedelta

from fastapi.concurrency import run_in_threadpool

from database import SessionLocal
from exeption.sftp_exception import SftpConfigUnreadable
from model.db_model import SftpSend
from repository.sftp_repository import SftpRepository
from repository.sftp_send_repository import Sftp_Send_Repository
from repository.system_config_repository import SystemConfigRepository
from service import alerting
from service.notification_manager import manager
from service.sftp_sender import MAX_ATTEMPTS, send_with_retries

logger = logging.getLogger(__name__)


def _shipment_id(send: SftpSend) -> int:
    return send.shipment_event.trip_assigned_id


def _process_sync(send_ids: list[int]) -> list[dict]:
    db = SessionLocal()
    try:
        send_repo = Sftp_Send_Repository(db)
        config_repo = SftpRepository(db)
        sends = [s for s in send_repo.get_by_ids(send_ids) if s.status == "pending"]
        if not sends:
            return []

        scac = SystemConfigRepository(db).get_scac()
        if not scac:
            send_repo.mark_failed_bulk(sends, "Sin SCAC configurado en el sistema")
            return _results(sends)

        by_config: dict[int, list[SftpSend]] = defaultdict(list)
        for send in sends:
            by_config[send.sent_to].append(send)

        for config_id, group in by_config.items():
            row = config_repo.get_config(config_id)
            if not row or not row.is_active:
                send_repo.mark_failed_bulk(group, "La configuración SFTP del cliente está desactivada")
                continue
            try:
                connection = config_repo.to_connection(row)
            except SftpConfigUnreadable as err:
                send_repo.mark_failed_bulk(group, str(err))
                alerting.report("sftp_config_unreadable", str(err), location=f"sftp_config:{config_id}")
                continue

            failed = send_with_retries(db, connection, group, scac)
            if failed:
                client_name = row.client.name if row.client else f"cliente {row.client_id}"
                alerting.report(
                    "sftp_send_failed",
                    f"Envío SFTP fallido tras {MAX_ATTEMPTS} intentos: {client_name}",
                    f"{len(failed)} archivo(s) sin enviar. Último error: {failed[-1].sftp_log}",
                    location=f"sftp_send:{config_id}",
                )
        return _results(sends)
    finally:
        db.close()


def _results(sends: list[SftpSend]) -> list[dict]:
    """Un aviso por embarque para el toast del frontend (useGlobalNotifications)."""
    per_shipment: dict[int, list[SftpSend]] = defaultdict(list)
    for send in sends:
        per_shipment[_shipment_id(send)].append(send)

    results = []
    for shipment_id, items in per_shipment.items():
        failed = [s for s in items if s.status != "sent"]
        if failed:
            message = f"{len(failed)} de {len(items)} XML no se enviaron por SFTP: {failed[-1].sftp_log}"
        else:
            message = f"{len(items)} XML enviado(s) por SFTP"
        results.append(
            {"shipment_id": shipment_id, "status": "FAILED" if failed else "SUCCESS", "message": message}
        )
    return results


async def process_sends(send_ids: list[int]) -> None:
    """Tarea de fondo: envía con reintentos y avisa al frontend. Nunca lanza."""
    try:
        results = await run_in_threadpool(_process_sync, send_ids)
    except Exception as err:
        title, detail, location = alerting.describe_exception(err)
        alerting.report("sftp_dispatch_crash", title, detail, location)
        return
    for result in results:
        await manager.broadcast(result)


def find_pending_to_resume(older_than: timedelta = timedelta(0)) -> list[int]:
    """Envíos que quedaron pendientes (p. ej. por un reinicio del backend)."""
    db = SessionLocal()
    try:
        return [s.id for s in Sftp_Send_Repository(db).get_stuck_pending(older_than)]
    finally:
        db.close()
