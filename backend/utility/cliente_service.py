from sqlalchemy.orm import Session

from model.db_model import Client
from schema import ClientRequest
from repository.cliente_repository import ClienteRepository

# Missing Client Schema


class ClienteService:
    def __init__(self, db: Session):
        self._db = ClienteRepository(db)

    def create_client(self, data: ClientRequest) -> Client:
        self._db.client_exist(data.name)
        new_client = Client(
            name=data.name, is_ftp=data.sftp_service, is_email=data.email_service
        )
        self._db.create_new_client(new_client)
        return new_client
