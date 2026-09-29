from typing import Any, List
from sqlalchemy.orm import Session

from repository.base_repository import BaseRepository
from model.db_model import EmailService, ClientEmailRecipient


class EmailRepository(BaseRepository[ClientEmailRecipient]):
    def __init__(self, db: Session):
        super().__init__(db, ClientEmailRecipient)
        self._db = db

    def get_all_email_data(self) -> List[ClientEmailRecipient]:
        sftp_data = self._db.query(ClientEmailRecipient).all()
        return sftp_data

    def add_email(self, client_id: int, email: str | List[str]):
        if isinstance(email, list):
            for e in email:
                new_email = ClientEmailRecipient(
                    client_id=client_id,
                    email=e,
                )
        else:
            new_email = ClientEmailRecipient(client_id=client_id, email=email)

        return new_email
