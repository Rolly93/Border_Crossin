"""Alertas a soporte por errores del servidor (nunca por errores del usuario).

Se reportan: excepciones no controladas (500), HTTPException >= 500, envíos SFTP que
fallan tras los 4 intentos, fallas del correo a clientes y configuraciones SFTP que no
se pueden descifrar. Las respuestas 4xx (validación, reglas de negocio, permisos,
no encontrado, conflicto) NO se reportan.

Cada error se guarda en `app_error`. Si el mismo error (misma huella) ya se vio en los
últimos 15 minutos, solo se incrementa su contador y no se vuelve a notificar.
"""

import hashlib
import html
import logging
import re
import threading
import traceback
from dataclasses import dataclass
from datetime import datetime, timedelta

from config import Env
from database import SessionLocal
from integrations.deps.aws_dep import get_lambda_client
from integrations.whatsapp_client import get_whatsapp_client
from repository.app_error_repository import AppErrorRepository
from repository.system_config_repository import SystemConfigRepository

logger = logging.getLogger(__name__)

DEDUP_WINDOW = timedelta(minutes=15)
MAX_DETAIL = 4000
# SQLAlchemy incluye los valores del query en el mensaje; pueden traer datos sensibles.
_SQL_PARAMS = re.compile(r"\[parameters: .*?\]", re.DOTALL)


@dataclass
class RequestContext:
    path: str | None = None
    method: str | None = None
    user_id: int | None = None


def _sanitize(text: str) -> str:
    return _SQL_PARAMS.sub("[parameters: <oculto>]", text)[-MAX_DETAIL:]


def describe_exception(exc: BaseException) -> tuple[str, str, str]:
    """(título, detalle, ubicación) de una excepción, sin datos sensibles."""
    frames = traceback.extract_tb(exc.__traceback__)
    location = f"{frames[-1].filename}:{frames[-1].lineno}" if frames else "?"
    title = f"{type(exc).__name__}: {_sanitize(str(exc))[:200]}"
    detail = _sanitize("".join(traceback.format_exception(type(exc), exc, exc.__traceback__)))
    return title, detail, location


def report(
    kind: str,
    title: str,
    detail: str | None = None,
    location: str | None = None,
    ctx: RequestContext | None = None,
) -> int | None:
    """Registra el error y, si es nuevo en la ventana, notifica. Nunca lanza.

    Devuelve el id de `app_error` (código que se muestra al usuario) o None.
    """
    ctx = ctx or RequestContext()
    fingerprint = hashlib.sha1(f"{kind}|{location or title}".encode()).hexdigest()
    now = datetime.now()
    db = SessionLocal()
    try:
        repo = AppErrorRepository(db)
        if existing := repo.find_since(fingerprint, now - DEDUP_WINDOW):
            repo.bump(existing, now)
            logger.error("Error repetido (%s, código %s, x%s): %s", kind, existing.id, existing.count, title)
            return existing.id

        from model.db_model import AppError

        row = repo.save(
            AppError(
                kind=kind,
                fingerprint=fingerprint,
                title=title[:300],
                detail=_sanitize(detail) if detail else None,
                path=ctx.path,
                method=ctx.method,
                user_id=ctx.user_id,
                count=1,
                first_seen=now,
                last_seen=now,
            )
        )
        scac = SystemConfigRepository(db).get_scac() or "-"
        error_id = row.id
        repo.mark_notified(row, now)
    except Exception:
        logger.exception("No se pudo registrar el error en app_error: %s", title)
        return None
    finally:
        db.close()

    logger.error("Error del servidor (%s, código %s): %s", kind, error_id, title)
    threading.Thread(
        target=_notify,
        args=(error_id, kind, title, detail or "", scac, now, ctx),
        daemon=True,
    ).start()
    return error_id


def _notify(
    error_id: int,
    kind: str,
    title: str,
    detail: str,
    scac: str,
    when: datetime,
    ctx: RequestContext,
) -> None:
    env = Env()
    installation = f"{env.INSTALLATION_NAME} ({scac})"
    stamp = when.strftime("%Y-%m-%d %H:%M:%S")

    route = " ".join(p for p in (ctx.method, ctx.path) if p) or "-"

    if env.ALERT_EMAILS and (lambda_client := get_lambda_client()):
        body = (
            f"<h3>Error del servidor en {html.escape(installation)}</h3>"
            f"<p><b>Código:</b> {error_id}<br><b>Tipo:</b> {html.escape(kind)}<br>"
            f"<b>Fecha:</b> {stamp}<br>"
            f"<b>Ruta:</b> {html.escape(route)}</p>"
            f"<p><b>{html.escape(title)}</b></p>"
            f"<pre style='white-space:pre-wrap'>{html.escape(detail[-3000:])}</pre>"
        )
        try:
            lambda_client.send_notice(
                to=env.ALERT_EMAILS,
                subject=f"[Border Crossin] Error {error_id} en {installation}: {title[:80]}",
                html=body,
            )
        except Exception:
            # Solo se registra: una falla del canal de alertas no genera otra alerta.
            logger.exception("No se pudo enviar el correo de alerta %s", error_id)

    if env.ALERT_WHATSAPP_TO and (wa := get_whatsapp_client()):
        try:
            wa.send_template(
                to=env.ALERT_WHATSAPP_TO,
                params=[installation, f"#{error_id} {title}", stamp],
            )
        except Exception:
            logger.exception("No se pudo enviar el WhatsApp de alerta %s", error_id)
