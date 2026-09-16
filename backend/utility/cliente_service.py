from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from model.db_model import Client
from repository.cliente_repository import ClienteRepository
from schema import ClientRequest
from schema.shipment_shcema import ShipmentUpdate

class ClienteService:

    def __init__(self, db: Session):
        self._db = ClienteRepository(db)

    def register_client(self, data: ClientRequest) -> dict:
        new_client = self.create_client(data)
        return {"status": "success", "data": new_client.name}

    def create_client(self, data: ClientRequest) -> Client:
        self._db.client_exist(data.name)
        new_client = Client(
            name=data.name,
            is_ftp=data.sftp_service,
            is_email=data.email_service,
        )
        self._db.create_new_client(new_client)
        return new_client

    def update_client_info(self, client_id: int, data: ClientRequest) -> Client:
        client = self._db.get_client_by_id(client_id)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client with id {client_id} not found",
            )

        client.name = data.name
        client.is_ftp = data.sftp_service
        client.is_email = data.email_service

        self._db.update_client(client.id, client)
        return client

    def it_has_sfpt_notification(
        self, client_id: int, shipment: ShipmentUpdate
    ) -> str | None:
        if self._db.it_has_sftp_service(id_val=client_id):
            return None

        return ""
