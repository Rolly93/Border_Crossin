from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from deps.auth import decrypt_password
from model.db_model import SftpSend
from repository.sftp_repository import SftpRepository
from schema.sftp_schema import SftpConfigurationRequest
from service.sftp_sender import send_batch


class SftpSendService:
    def __init__(self, db: Session):
        self._db = db
        self._repo = SftpRepository(db)

    def list_sends(
        self,
        client_id: Optional[int] = None,
        reference: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> List[dict]:
        rows = self._repo.list_sends(client_id, reference, status_filter)
        return [self._to_dict(row) for row in rows]

    def resend(self, send_ids: List[int]) -> List[dict]:
        sends = self._repo.get_sends_by_ids(send_ids)

        found = {s.id for s in sends}
        missing = [i for i in send_ids if i not in found]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Envíos no encontrados: {missing}",
            )

        not_failed = [s.id for s in sends if s.status != "failed"]
        if not_failed:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Solo se reenvían envíos fallidos. No reenviables: {not_failed}",
            )

        groups: dict[int, List[SftpSend]] = {}
        for send in sends:
            groups.setdefault(send.sent_to, []).append(send)

        for group in groups.values():
            service_row = group[0].service
            config = SftpConfigurationRequest(
                id=service_row.id,
                host=service_row.host,
                client_id=service_row.client_id,
                username=service_row.username,
                port=service_row.port,
                root_folder=service_row.root_folder,
                remote_folder=service_row.remote_folder,
                encrypted_password=decrypt_password(service_row.encrypted_password),
            )
            # Reenvío manual: cada envío recibe de nuevo sus 3 reintentos.
            for send in group:
                send.retries = 0
            self._db.commit()
            send_batch(self._db, config, group)

        return [self._to_dict(s) for s in sends]

    def _to_dict(self, send: SftpSend) -> dict:
        return {
            "id": send.id,
            "filename": send.filename,
            "status": send.status,
            "retries": send.retries,
            "sftp_log": send.sftp_log,
            "sent_to": send.sent_to,
            "client_id": send.service.client_id,
            "reference": send.shipment_event.trip.customer_tracking,
            "shipment_event_id": send.shipment_event_id,
        }
