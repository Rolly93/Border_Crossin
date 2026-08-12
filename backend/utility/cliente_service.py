from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from model.db_model import Client, ClientEmailRecipient
from schema import ClientRequest, ClientResponse

# Missing Client Schema


class ClienteService:
    def __init__(self, db: Session):
        self.db = db

    def get_clients(self) -> list[ClientResponse]:
        clients = (
            self.db.query(Client).options(joinedload(Client.email_recipients)).all()
        )

        result = []
        for client in clients:
            active_emails = [
                rec.email for rec in client.email_recipients if rec.is_active
            ]

            result.append(
                ClientResponse(
                    id=client.id,
                    name=client.name,
                    sftService=client.is_ftp,
                    emailService=client.is_email_service,
                    email=active_emails if active_emails else None,
                )
            )

        return result
