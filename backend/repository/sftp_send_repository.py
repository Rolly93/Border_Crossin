from sqlalchemy.orm import Session

from model.db_model import SftpSend, SftpService, ShipmentAssign, ShipmentEventModel
from repository.base_repository import BaseRepository
from schema.sftp_schema import SftpConfigurationRequest


class Sftp_Send_Repository(BaseRepository[SftpSend]):
    def __init__(self, db: Session):
        super().__init__(db, SftpSend)

    def create(
        self,
        event: list[ShipmentEventModel],
        filename: str,
        status: str,
        sftp_config: SftpConfigurationRequest,
    ) -> list[SftpSend]:
        sends = [
            SftpSend(
                shipment_event_id=e.id,
                filename=filename,
                local_path="",
                status=status or "pending",
                sent_to=sftp_config.id,
                retries=0,
            )
            for e in event
        ]
        self._db.add_all(sends)
        self._db.commit()

        for send in sends:
            self._db.refresh(send)

        return sends

    def save_generated_xml(
        self, send: SftpSend, local_path: str, filename: str
    ) -> SftpSend:
        send.local_path = local_path
        send.filename = filename
        self._db.commit()
        self._db.refresh(send)
        return send

    def mark_sent(self, send: SftpSend) -> SftpSend:
        send.status = "sent"
        send.sftp_log = None
        self._db.commit()
        self._db.refresh(send)
        return send

    def mark_failed(
        self, send: SftpSend, error: str, increment_retries: bool = False
    ) -> SftpSend:
        send.status = "failed"
        send.sftp_log = error
        if increment_retries:
            send.retries += 1
        self._db.commit()
        self._db.refresh(send)
        return send

    def mark_failed_bulk(self, sends: list[SftpSend], error: str) -> list[SftpSend]:
        for send in sends:
            send.status = "failed"
            send.sftp_log = error
        self._db.commit()
        return sends

    def reset_retries(self, sends: list[SftpSend]) -> list[SftpSend]:
        for send in sends:
            send.retries = 0
        self._db.commit()
        return sends

    def sftp_get_list_files(
        self,
        client_id: int | None = None,
        reference: str | None = None,
        status: str | None = None,
    ):
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
