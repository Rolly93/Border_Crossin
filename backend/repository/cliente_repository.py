from typing import Optional

from sqlalchemy import and_, exists

from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from repository.base_repository import BaseRepository
from model.db_model import Client
from schema import ClientRequest, ClientResponse


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
                    sftp_service=client.is_ftp,
                    email_service=client.is_email_service,
                    email=active_emails if active_emails else None,
                )
            )

        return result

    def get_clients(self):
        return self._db.query(Client).all()

    def it_has_email(self, id: int):
        return (
            self._db.query(Client)
            .filter(exists().where(and_(Client.id == id, Client.is_email_service)))
            .scalar()
        )

    def it_has_sftp_service(self, id_val: int) -> bool:
        return bool(
            self._db.query(Client)
            .filter(exists().where(and_(Client.id == id_val, Client.is_ftp)))
            .scalar()
        )

    def create_new_client(self, data: Client) -> Client:
        data_client = Client(**data.dump_json())
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
