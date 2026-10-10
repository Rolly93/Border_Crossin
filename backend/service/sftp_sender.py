import logging
from typing import List

from sqlalchemy.orm import Session

from model.db_model import SftpSend
from schema.sftp_schema import SftpConfigurationRequest
from service.sftp_service import SFTPService

logger = logging.getLogger(__name__)

# Reintentos automáticos después del primer intento (4 intentos en total).
MAX_RETRIES = 3


def send_batch(
    db: Session, config: SftpConfigurationRequest, sends: List[SftpSend]
) -> None:
    """Envía un lote por una sola conexión SFTP y actualiza cada registro."""
    sftp = SFTPService(config)
    try:
        for send in sends:
            _send_one(db, sftp, send)
    finally:
        sftp.close()


def _send_one(db: Session, sftp: SFTPService, send: SftpSend) -> None:
    total_attempts = 1 + MAX_RETRIES
    for attempt in range(total_attempts):
        try:
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
            is_last_attempt = attempt == total_attempts - 1
            if not is_last_attempt:
                send.retries += 1
            db.commit()
            logger.warning(
                "Envío %s falló (intento %s/%s): %s",
                send.id, attempt + 1, total_attempts, send.sftp_log,
            )
            sftp.close()
