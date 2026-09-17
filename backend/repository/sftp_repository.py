from typing import Any

from pydantic import BaseModel
from sqlalchemy.orm import Session

from repository.base_repository import BaseRepository
from model.db_model import SftpService
from schema import SftpResponse, SftpConfiRequst


class SftpRepository(BaseRepository[SftpService]):
    def __init__(self, db: Session):
        super().__init__(db, SftpService)
        self._db = db
        self._connection = self.get_connectios

    def get_connectios(self):
        pass

    def get_sftp_data(self, client_id: int) -> SftpResponse:
        return (
            self._db.query(SftpService)
            .filter(SftpService.client_id == client_id)
            .first()
        )

    def update(self, id_sftp: str | int, sftp_data: BaseModel) -> SftpService | None:
        return super().update(id_sftp, sftp_data)

    def insert_sftp_service(self, sftp_data: SftpConfiRequst) -> SftpResponse:
        data_dict = sftp_data.model_dump(exclude_unset=True)
        new_seftp_service = SftpService(**data_dict)
        return self.save(new_seftp_service)
