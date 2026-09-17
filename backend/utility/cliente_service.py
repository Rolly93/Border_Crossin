from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import Literal
from model.db_model import Client
from repository.cliente_repository import ClienteRepository
from schema import ClientRequest, ClientResponse, ClientModel
from schema.shipment_shcema import ShipmentUpdate

ServiceType = Literal["sftp_service", "email_service", "sms_service"]


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

    def get_client_service(
        self, client_id: int, service_type: ServiceType
    ) -> ClientModel | None:
        client_data = self._db.has_active_service(client_id)
        if client_data.sftp_service or client_data.email_service:
            data_client = ClientModel(
                id=client_data.id,
                name=client_data.name,
                sftp_service=client_data.sftp_service,
                email_service=client_data.email_service,
            )
            return data_client
        return None
