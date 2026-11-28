from datetime import datetime, timedelta

from sqlalchemy import or_
from sqlalchemy.orm import Session

from model.db_model import SftpSend, SftpService, ShipmentAssign, ShipmentEventModel
from repository.base_repository import BaseRepository


class Sftp_Send_Repository(BaseRepository[SftpSend]):
    def __init__(self, db: Session):
        super().__init__(db, SftpSend)

    def create(
        self,
        event: list[ShipmentEventModel],
        filename: str,
        status: str,
        config_id: int,
    ) -> list[SftpSend]:
        sends = [
            SftpSend(
                shipment_event_id=e.id,
                filename=filename,
                local_path="",
                status=status or "pending",
                sent_to=config_id,
                retries=0,
            )
            for e in event
        ]
        return self.save_all(sends)

    def get_by_ids(self, send_ids: list[int]) -> list[SftpSend]:
        return self._db.query(SftpSend).filter(SftpSend.id.in_(send_ids)).all()

    def get_stuck_pending(self, older_than: timedelta) -> list[SftpSend]:
        """Pendientes sin intento reciente (p. ej. el backend se reinició a medio envío)."""
        limit = datetime.now() - older_than
        return (
            self._db.query(SftpSend)
            .filter(
                SftpSend.status == "pending",
                or_(SftpSend.last_attempt_at.is_(None), SftpSend.last_attempt_at < limit),
            )
            .all()
        )

    def save_generated_xml(
        self, send: SftpSend, local_path: str, filename: str
    ) -> SftpSend:
        send.local_path = local_path
        send.filename = filename
        return self.save(send)

    def mark_sent(self, send: SftpSend) -> SftpSend:
        send.status = "sent"
        send.sftp_log = None
        send.last_attempt_at = datetime.now()
        return self.save(send)

    # `retries` cuenta los intentos fallidos (4 = se agotaron los automáticos).

    def mark_retry(self, send: SftpSend, error: str) -> SftpSend:
        """Falló un intento pero quedan más: sigue pendiente."""
        send.status = "pending"
        send.sftp_log = error
        send.retries += 1
        send.last_attempt_at = datetime.now()
        return self.save(send)

    def mark_failed(self, send: SftpSend, error: str) -> SftpSend:
        """Falló el último intento: queda para reenvío manual."""
        send.status = "failed"
        send.sftp_log = error
        send.retries += 1
        send.last_attempt_at = datetime.now()
        return self.save(send)

    def mark_failed_bulk(self, sends: list[SftpSend], error: str) -> list[SftpSend]:
        now = datetime.now()
        for send in sends:
            send.status = "failed"
            send.sftp_log = error
            send.last_attempt_at = now
        self.commit()
        return sends

    def reset_retries(self, sends: list[SftpSend]) -> list[SftpSend]:
        for send in sends:
            send.retries = 0
        self.commit()
        return sends

    def sftp_get_list_files(
        self,
        client_id: int | None = None,
        reference: str | None = None,
        status: str | None = None,
    ) -> list[SftpSend]:
        qr = (
            self._db.query(SftpSend)
            .join(SftpService, SftpSend.sent_to == SftpService.id)
            .join(
                ShipmentEventModel,
                SftpSend.shipment_event_id == ShipmentEventModel.id,
            )
            .join(
                ShipmentAssign,
                ShipmentEventModel.trip_assigned_id == ShipmentAssign.id,
            )
        )
        if client_id is not None:
            qr = qr.filter(SftpService.client_id == client_id)
        if reference:
            qr = qr.filter(
                ShipmentAssign.customer_tracking.icontains(
                    reference.strip(), autoescape=True
                )
            )
        if status:
            qr = qr.filter(SftpSend.status == status)

        return qr.order_by(SftpSend.id.desc()).all()
