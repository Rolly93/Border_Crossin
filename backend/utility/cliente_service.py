from sqlalchemy.orm import Session

from model.db_model import Client
from repository.cliente_repository import ClienteRepository
from schema import ClientRequest
from schema.shipment_shcema import ShipmentUpdate
from utility.user_service import UserService


class ClienteService:

    def __init__(self, db: Session):
        self._db = ClienteRepository(db)
        self._auth = UserService(db)

    def register_client(self, admin_id: int, data: ClientRequest) -> dict:
        self._auth.verify_admin(admin_id)
        new_client = self.create_client(data)
        return {"status": "success", "data": new_client.name}

    def update_client_info(self, admin_id: int, data: ClientRequest) -> ClientRequest:
        self._auth.verify_admin(admin_id)
        return data

    def create_client(self, data: ClientRequest) -> Client:
        self._db.client_exist(data.name)
        new_client = Client(
            name=data.name,
            is_ftp=data.sftp_service,
            is_email=data.email_service,
        )
        self._db.create_new_client(new_client)
        return new_client

    def it_has_sfpt_notification(self, client_id: int, shipment: ShipmentUpdate) -> str:
        self._db.it_has_sftp_service(id=client_id)
        return ""
