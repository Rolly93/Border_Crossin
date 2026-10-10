from typing import Any, List

from pydantic import BaseModel
from sqlalchemy.orm import Session

from repository.base_repository import BaseRepository
from model.db_model import SftpService, SftpSend, ShipmentAssign, ShipmentEventModel
from schema import SftpResponse, SftpConfiRequst, SftpConfigurationRequest
from deps.auth import encrypt_password, decrypt_password


class SftpRepository(BaseRepository[SftpService]):
    def __init__(self, db: Session):
        super().__init__(db, SftpService)
        self._db = db

    def get_sftp_data(self, client_id: int) -> SftpConfigurationRequest | None:
        raw_sftp_config = (
            self._db.query(SftpService)
            .filter(SftpService.client_id == client_id)
            .first()
        )
        if not raw_sftp_config:
            return None
        return SftpConfigurationRequest(
            id=raw_sftp_config.id,
            client_id=raw_sftp_config.client_id,
            host=raw_sftp_config.host,
            username=raw_sftp_config.username,
            port=raw_sftp_config.port,
            root_folder=raw_sftp_config.root_folder,
            remote_folder=raw_sftp_config.remote_folder,
            encrypted_password=decrypt_password(raw_sftp_config.encrypted_password),
        )

    def update(self, id_sftp: str | int, sftp_data: BaseModel) -> SftpService | None:
        return super().update(id_sftp, sftp_data)

    def get_all_sftp_data(self) -> List[SftpService]:
        sftp_data = self._db.query(SftpService).all()
        return sftp_data

    def insert_sftp_service(self, sftp_data: SftpConfiRequst) -> SftpService:
        encrypt_paswd = encrypt_password(sftp_data.encrypted_password)
        sftp_data.encrypted_password = encrypt_paswd
        data_dict = sftp_data.model_dump(exclude_unset=True)
        new_seftp_service = SftpService(**data_dict)
        return self.save(new_seftp_service)

    def list_sends(
        self,
        client_id: int | None = None,
        reference: str | None = None,
        status: str | None = None,
    ) -> List[SftpSend]:
        query = (
            self._db.query(SftpSend)
            .join(SftpService, SftpSend.sent_to == SftpService.id)
            .join(ShipmentEventModel, SftpSend.shipment_event_id == ShipmentEventModel.id)
            .join(ShipmentAssign, ShipmentEventModel.trip_assigned_id == ShipmentAssign.id)
        )
        if client_id is not None:
            query = query.filter(SftpService.client_id == client_id)
        if reference:
            query = query.filter(ShipmentAssign.customer_tracking == reference)
        if status:
            query = query.filter(SftpSend.status == status)
        return query.order_by(SftpSend.id.desc()).all()

    def get_sends_by_ids(self, send_ids: List[int]) -> List[SftpSend]:
        return self._db.query(SftpSend).filter(SftpSend.id.in_(send_ids)).all()
