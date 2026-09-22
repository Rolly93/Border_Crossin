import select
from typing import List, Optional

from sqlalchemy import and_, exists, select
from sqlalchemy.orm import Session, selectinload, joinedload
from fastapi import HTTPException, status
from repository.base_repository import BaseRepository
from model.db_model import Client, ClientEmailRecipient
from schema import ClientRequest, ClientResponse, ClientModel
from enum import Enum


class ClientServiceType(str, Enum):
    SFTP = "sftp_service"
    EMAIL = "email_service"


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
                    sftService=client.is_ftp,
                    emailService=client.is_email_service,
                    email=active_emails,
                )
            )

        return result

    def get_clients(self):
        return self._db.query(Client).all()

    def has_active_service(self, client_id: int) -> ClientModel:
        return (
            self._db.query(Client)
            .filter(exists().where(Client.id == client_id))
            .scalar()
        )

    def create_new_client(self, data: Client) -> Client:
        dict_client = data.model_dump(exclude_unset=True)
        data_client = Client(**dict_client)
        self.save(data_client)
        return data_client

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
