from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from exeption.sftp_exception import SftpConfigUnreadable
from model.db_model import SftpSend
from repository.sftp_repository import SftpRepository
from repository.sftp_send_repository import Sftp_Send_Repository
from repository.system_config_repository import SystemConfigRepository
from schema.sftp_schema import Sftp_Resend_Response
from service import alerting
from service.sftp_sender import send_once

# Un envío "pending" sin intentos en este tiempo se considera atorado y se puede reenviar.
STUCK_AFTER = timedelta(minutes=10)


class SftpSendService:
    def __init__(self, db: Session):
        self._db = db
        self._send_repo = Sftp_Send_Repository(db)
        self._config_repo = SftpRepository(db)

    def list_sends(
        self,
        client_id: int | None,
        reference: str | None,
        status_filter: str | None,
    ) -> list[Sftp_Resend_Response]:
        rows = self._send_repo.sftp_get_list_files(client_id, reference, status_filter)
        return [self._to_dict(row) for row in rows]

    @staticmethod
    def _is_resendable(send: SftpSend) -> bool:
        if send.status == "failed":
            return True
        if send.status == "pending":
            return send.last_attempt_at is None or send.last_attempt_at < datetime.now() - STUCK_AFTER
        return False

    def resend(self, send_ids: list[int]) -> list[Sftp_Resend_Response]:
        """Reenvío manual: un intento inmediato por archivo con la configuración ACTIVA del cliente."""
        scac = SystemConfigRepository(self._db).get_scac()
        if not scac:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Configura el SCAC del sistema antes de reenviar",
            )

        sends = self._send_repo.get_by_ids(send_ids)
        found = {s.id for s in sends}
        if missing := [i for i in send_ids if i not in found]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Envíos no encontrados: {missing}",
            )
        if not_resendable := [s.id for s in sends if not self._is_resendable(s)]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Solo se reenvían envíos fallidos o pendientes atorados "
                    f"(más de {int(STUCK_AFTER.total_seconds() // 60)} min). "
                    f"No reenviables: {not_resendable}"
                ),
            )

        by_client: dict[int, list[SftpSend]] = defaultdict(list)
        for send in sends:
            by_client[send.service.client_id].append(send)

        for client_id, group in by_client.items():
            # Siempre la configuración vigente, aunque el envío se haya creado con otra.
            if not (row := self._config_repo.get_active_config(client_id)):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"El cliente {group[0].service.client.name} no tiene SFTP activo",
                )
            try:
                connection = self._config_repo.to_connection(row)
            except SftpConfigUnreadable as err:
                alerting.report("sftp_config_unreadable", str(err), location=f"sftp_config:{row.id}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
                ) from err

            for send in group:
                send.sent_to = row.id
            self._send_repo.reset_retries(group)
            send_once(self._db, connection, group, scac)

        return [self._to_dict(s) for s in sends]

    def _to_dict(self, send: SftpSend) -> Sftp_Resend_Response:
        return Sftp_Resend_Response(
            id=send.id,
            filename=send.filename,
            status=send.status,
            retries=send.retries,
            sftp_log=send.sftp_log,
            sent_to=send.sent_to,
            client_id=send.service.client_id,
            reference=send.shipment_event.trip.customer_tracking,
            shipment_event_id=send.shipment_event_id,
            last_attempt_at=send.last_attempt_at,
        )
