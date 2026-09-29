from typing import List, Optional
from enum import Enum
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload, joinedload
from fastapi import HTTPException

from repository.base_repository import BaseRepository
from repository.email_repository import EmailRepository
from model.db_model import Client
from schema.client_schema import ClientPaginateData, PaginatedClientResponse
from schema import ClientRequest, ClientResponse


class ClientServiceType(str, Enum):
    SFTP = "sftService"
    EMAIL = "emailService"


class ClienteRepository(BaseRepository[Client]):
    def __init__(self, db: Session):
        super().__init__(db, Client)
        self._emailrepo = EmailRepository(db)

    def get_clients_names(self) -> list[dict[str, str | int]]:
        stmt = select(Client.id, Client.name).where(Client.still_active == True)
        results = self._db.execute(stmt).all()
        return [{"id": row.id, "name": row.name} for row in results]

    def delete_client(self, id: int):
        stmt = self._db.query(Client).where(Client.id == id).first()
        self.delete(stmt)

    def add_emails_to_client(self, client_id: int, client_emails: list[str]):
        """Delegates completely to EmailRepository."""
        if not client_emails:
            return

        self._emailrepo.add_email(client_id, client_emails)

    def create_new_client(self, client_data: ClientRequest) -> Client:
        """
        Creates a client and handles initial email recipient setup cleanly.
        """

        emails_to_add = client_data.email if client_data.email else []

        client_dict = client_data.model_dump(exclude={"email"})
        new_client = Client(**client_dict)

        saved_client = self.save(new_client)
        print("client data", client_data)
        if saved_client.emailService and emails_to_add:
            self.add_emails_to_client(saved_client.id, emails_to_add)
            self._db.refresh(saved_client)

        return saved_client

    def get_client_by_id(self, id_val: int) -> Optional[Client]:
        return self.get_by_id(id_val)

    def toggle_service(
        self, client_id: int, service: ClientServiceType, is_active: bool = False
    ) -> Client:
        client = self.get_client_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        setattr(client, service.value, is_active)
        return self.save(client)

    def get_all_clients(
        self, page: int = 1, limit: int = 10
    ) -> PaginatedClientResponse:
        offset = (page - 1) * limit
        total_records = self._db.query(Client).count()

        stmt = (
            select(Client)
            .options(selectinload(Client.email_recipients))
            .offset(offset)
            .limit(limit)
        )
        clients_orm = self._db.scalars(stmt).all()

        has_next_page = (offset + limit) < total_records
        formatted_clients = []

        for client in clients_orm:
            active_emails = [
                rec.email
                for rec in client.email_recipients
                if getattr(rec, "is_active", True)
            ]

            formatted_clients.append(
                ClientPaginateData(
                    id=client.id,
                    name=client.name,
                    telefono=str(client.phonenumber) if client.phonenumber else None,
                    emailService=client.emailService,
                    sftService=client.sftService,
                    email=active_emails,
                )
            )

        return PaginatedClientResponse(
            data=formatted_clients,
            totalRecords=total_records,
            hasNextPage=has_next_page,
            page=page,
            limit=limit,
        )
