from sqlalchemy.orm import Session

from schema.shipment_shcema import ShipmentUpdate
from service.sftp import SFPTService
from model.db_model import Client
from schema import ClientRequest
from repository.cliente_repository import ClienteRepository


class ClienteService:
    def __init__(self, db: Session):
        self._db = ClienteRepository(db)
        # self._sftp_service = SFPTService()

    def create_client(self, data: ClientRequest) -> Client:
        self._db.client_exist(data.name)
        new_client = Client(
            name=data.name, is_ftp=data.sftp_service, is_email=data.email_service
        )
        self._db.create_new_client(new_client)
        return new_client

    def it_has_sfpt_notification(self, client_id: int, shipment: ShipmentUpdate) -> str:
        self._db.it_has_sftp_service(id=client_id)
        return ""
