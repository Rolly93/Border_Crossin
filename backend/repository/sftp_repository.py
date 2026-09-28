from typing import Any, List

from pydantic import BaseModel
from sqlalchemy.orm import Session

from repository.base_repository import BaseRepository
from model.db_model import SftpService
from schema import SftpResponse, SftpConfiRequst, SftpConfigurationRequest
from deps.auth import encrypt_password, decrypt_password


class SftpRepository(BaseRepository[SftpService]):
    def __init__(self, db: Session):
        super().__init__(db, SftpService)
        self._db = db

    def get_sftp_data(self, client_id: int) -> SftpConfigurationRequest:
        raw_sftp_config = (
            self._db.query(SftpService)
            .filter(SftpService.client_id == client_id)
            .first()
        )
        if not raw_sftp_config:
            raise ValueError("SFTP configuration does not exist")
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

    def insert_sftp_service(self, sftp_data: SftpConfiRequst) -> SftpResponse:
        encrypt_paswd = encrypt_password(sftp_data.encrypted_password)
        sftp_data.encrypted_password = encrypt_paswd
        data_dict = sftp_data.model_dump(exclude_unset=True)
        new_seftp_service = SftpService(**data_dict)
        return self.save(new_seftp_service)
