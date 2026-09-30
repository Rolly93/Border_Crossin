from typing import List, Literal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from model.db_model import Client
from repository.cliente_repository import ClienteRepository, ClientServiceType
from repository.email_repository import EmailRepository
from repository.sftp_repository import SftpRepository
from schema.client_schema import MetricsClientResponse
from schema.sftp_schema import SftpConfiRequst
from schema import (
    ClientRequest,
    ClienteServiceResponse,
    SftpConfigurationRequest,
    EmailConfigurationRequest,
)

ServiceType = Literal["sftp_service", "email_service", "sms_service"]


class ClienteService:

    def __init__(self, db: Session):
        self._db = ClienteRepository(db)
        self._sftp_service = SftpRepository(db)
        self._email_repo = EmailRepository(db)

    def config_sftp(self, sftp_data: SftpConfigurationRequest):
        new_connection = SftpConfiRequst(**sftp_data.model_dump())
        return self._sftp_service.insert_sftp_service(new_connection)

    def create_client(self, data: ClientRequest) -> Client:
        new_client = self._db.create_new_client(data)

        emails_to_add = data.email if data.email else []
        if new_client.emailService and emails_to_add:
            self._db.add_emails_to_client(new_client.id, emails_to_add)
        return new_client

    def update_client_info(self, client_id: int, data: ClientRequest) -> Client:
        client = self._db.get_client_by_id(client_id)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client with id {client_id} not found",
            )

        client.name = data.name
        client.phonenumber = data.phonenumber
        client.sftService = data.sftService
        client.emailService = data.emailService
        if client.emailService and data.email:
            self._db.add_emails_to_client(client_id, data.email)

        return self._db.save(client)

    def get_client_service(
        self, client_id: int, service_type: ServiceType
    ) -> ClienteServiceResponse:

        client = self._db.get_client_by_id(client_id)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client with id {client_id} not found",
            )

        sftp_service: SftpConfigurationRequest | None = None
        email_service: EmailConfigurationRequest | None = None

        if service_type == "sftp_service":
            sftp_data = self._sftp_service.get_sftp_data(client.id)
            if sftp_data:
                sftp_service = SftpConfigurationRequest.model_validate(
                    sftp_data.model_dump()
                )

        if service_type == "email_service":
            active_emails = [
                rec.email for rec in client.email_recipients if rec.is_active
            ]
            email_service = EmailConfigurationRequest(email=active_emails)

        return ClienteServiceResponse(
            id=client.id,
            name=client.name,
            sftService=sftp_service,
            emailService=email_service,
        )

    def get_all_clients(self, page: int = 1, limit: int = 10):
        return self._db.get_all_clients(page, limit)

    def get_client_dropdown_options(self) -> list[dict[str, str | int]]:
        return self._db.get_clients_names()

    def delete_client(self, client_id: int):
        client_to_inactive = self._db.get_client_by_id(client_id)
        if client_to_inactive is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client with id {client_id} not found",
            )

        self._db.toggle_client_status(client_to_inactive.id, False)
        self._email_repo.toggle_client_emails(client_to_inactive.id, False)
        self._db.save(client_to_inactive)
        return

    def reactive_client(self, client_id: int):
        client_to_reactive = self._db.get_client_by_id(client_id)
        if client_to_reactive is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client with id {client_id} not found",
            )

        self._db.toggle_client_status(client_to_reactive.id, True)
        self._email_repo.toggle_client_emails(client_to_reactive.id, True)
        self._db.save(client_to_reactive)
        return

    def get_metrics(self) -> MetricsClientResponse:
        sftp_data = self._sftp_service.get_all_sftp_data()
        email_data = self._email_repo.get_all_email_data()
        all_clients = self._db.get_clients_names()

        return MetricsClientResponse(
            totalClients=len(all_clients),
            emailService=len(email_data),
            sftpService=len(sftp_data),
        )
