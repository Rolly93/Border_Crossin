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

    def _client_exist(self, id: int) -> None | Client:
        client = self._db.query(Client).filter(Client.id == id).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"client with id {id} not found",
            )

        return client

    def get_clients(self):
        return self._db.query(Client).all()

    def it_has_email(self, id: int):
        return (
            self._db.query(Client)
            .filter(exists().where(and_(Client.id == id, Client.is_email_service)))
            .scalar()
        )

    def it_has_sftp_service(self, id: int):
        return (
            self._db.query(Client)
            .filter(exists().where(and_(Client.id == id, Client.is_ftp)))
            .scalar()
        )

    def create_new_client(self, data: Client) -> Client:
        data_client = Client(**data.dump_json())
        self.save(data_client)
        return data_client

    def update_client(self, cliente_id: int, cliente_data: ClientRequest) -> Client:
        client = self._client_exist(cliente_id)

        update_data = cliente_data.model_dump(exclude_unset=True)

        for k, v in update_data.items():
            setattr(client, k, v)
        self._db.commit()
        self._db.refresh(client)
        return client

    def delete_client(self, client_id: int) -> None:
        client = self._client_exist(client_id)
        self._db.delete(client)
        self._db.commit()

    def client_exist(self, name: str) -> list[Client]:
        db_client = self._db.query(Client).filter(Client.name == name).all()
        if db_client:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Cliente Duplicado"
            )
        return db_client
