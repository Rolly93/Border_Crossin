from typing import Any, List
from sqlalchemy.orm import Session

from repository.base_repository import BaseRepository
from model.db_model import EmailService


class EmailRepository(BaseRepository[EmailService]):
    def __init__(self, db: Session):
        super().__init__(db, EmailService)
        self._db = db

    def get_all_email_data(self) -> List[EmailService]:
        sftp_data = self._db.query(EmailService).all()
        return sftp_data
