from typing import Any, List
from sqlalchemy.orm import Session

from repository.base_repository import BaseRepository
from model.db_model import ClientEmailRecipient


class EmailRepository(BaseRepository[ClientEmailRecipient]):
    def __init__(self, db: Session):
        super().__init__(db, ClientEmailRecipient)
        self._db = db

    def get_all_email_data(self) -> List[ClientEmailRecipient]:
        email_data = (
            self._db.query(ClientEmailRecipient)
            .where(ClientEmailRecipient.is_active == True)
            .all()
        )
        return email_data

    def sync_client_emails(self, client_id: int, emails: str | List[str]):
        incoming_emails = set([emails] if isinstance(emails, str) else emails)

        existing_records = (
            self._db.query(ClientEmailRecipient)
            .filter(ClientEmailRecipient.client_id == client_id)
            .all()
        )

        existing_emails = {record.email: record for record in existing_records}

        for email, record in existing_emails.items():
            if email not in incoming_emails:
                self._db.delete(record)
        new_records = []
        for email in incoming_emails:
            if email not in existing_emails:
                new_record = ClientEmailRecipient(client_id=client_id, email=email)
                new_records.append(new_record)
        if new_records:
            self._db.add_all(new_records)

        return list(incoming_emails)

    def toggle_client_emails(self, client_id: int, status: bool):
        updated_count = (
            self._db.query(ClientEmailRecipient)
            .filter(ClientEmailRecipient.client_id == client_id)
            .update({"is_active": status}, synchronize_session=False)
        )
        return updated_count
