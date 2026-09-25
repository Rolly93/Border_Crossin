import select
from typing import List, Optional

from sqlalchemy import and_, exists, select
from sqlalchemy.orm import Session, selectinload, joinedload
from fastapi import HTTPException, status
from schema.sftp_schema import SftpConfigProcess
from repository.base_repository import BaseRepository
from model.db_model import Client, ClientEmailRecipient
from schema import ClientRequest, ClientResponse, ClientModel
from enum import Enum


class ClientServiceType(str, Enum):
    SFTP = "sftService"
    EMAIL = "emailService"


class ClienteRepository(BaseRepository[Client]):
    def __init__(self, db: Session):
        super().__init__(db, Client)
        self._db = db

    def get_clients_email(self) -> list[ClientResponse]:
        clients = (
            self._db.query(Client).options(joinedload(Client.email_recipients)).all()
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
                    telefono=client.te,
                    sftService=client.is_ftp,
                    emailService=client.is_email_service,
                    email=active_emails,
                )
            )

        return result

    def get_clients(self) -> List[Client]:
        stmt = select(Client).options(
            selectinload(Client.email_recipients), selectinload(Client.sftp_services)
        )
        return self._db.query(Client).all()

    def has_active_service(self, client_id: int) -> ClientModel:
        return (
            self._db.query(Client)
            .filter(exists().where(Client.id == client_id))
            .scalar()
        )

    def add_emails_to_client(self, client_id: int, client_emails: list[str]):
        client = self._db.query(Client).filter(Client.id == client_id).first()

        if not client:
            raise ValueError("Client Not found")

        existing_email = {rec.email.strip().lower() for rec in client.email_recipients}
        for email_str in client_emails:
            clean_email = email_str.strip().lower()
            if clean_email in existing_email:
                continue
            new_email = ClientEmailRecipient(client_id=client_id, email=clean_email)
            client.email_recipients.append(new_email)

        self._db.commit()

    def add_sftp_connection(self, data: SftpConfigProcess):
        client = self._db.query(Client).filter(Client.id == data.client_id).first()
        if not client:
            raise ValueError("Client Not found")

    def create_new_client(self, data: Client) -> Client:

        new_client = self.save(data)

        if new_client.emailService:
            self.add_emails_to_client(new_client.id, new_client.email_recipients)
        return data

    def update_client(self, cliente_id: int, client_data: ClientRequest) -> Client:
        update_client = self.update(cliente_id, client_data)

        if not update_client:
            raise HTTPException(status_code=404, detail="User not found")

        return update_client

    def delete_client(self, client_id: int) -> None:

        client = self.get_client_by_id(client_id)
        self.delete(client)

    def client_exist(self, name: str) -> Optional[Client]:
        return self._db.query(Client).filter(Client.name == name).first()

    def get_client_by_id(self, id_val: int) -> Optional[Client]:
        return self.get_by_id(id_val)

    def toggle_service(
        self, client_id: int, service: ClientServiceType, is_active: bool = False
    ) -> Client:
        client_data = self.has_active_service(client_id)
        setattr(client_data, service.value, is_active)
        return self.update(client_id, client_data)

    def get_all_clients(self, page: int = 1, limit: int = 10) -> List[Client]:
        offset = (page - 1) * limit

        stmt = (
            select(Client)
            .options(selectinload(Client.email_recipients))
            .offset(offset)
            .limit(limit)
        )

        clients = list(self._db.scalars(stmt).all())
        return clients
