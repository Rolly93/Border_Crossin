from enum import Enum

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from model.db_model import Client, SftpService
from repository.base_repository import BaseRepository
from repository.email_repository import EmailRepository
from schema import ClientRequest
from schema.client_schema import ClientPaginateData, PaginatedClientResponse


class ClientServiceType(str, Enum):
    SFTP = "sftService"
    EMAIL = "emailService"


class ClienteRepository(BaseRepository[Client]):
    def __init__(self, db: Session):
        super().__init__(db, Client)
        self._emailrepo = EmailRepository(db)

    def get_clients_names(self) -> list[dict[str, str | int | bool]]:
        has_sftp = (
            select(SftpService.id)
            .where(
                SftpService.client_id == Client.id,
                SftpService.is_active.is_(True),
            )
            .exists()
        )
        stmt = select(Client.id, Client.name, has_sftp.label("has_sftp")).where(
            Client.still_active == True
        )
        results = self._db.execute(stmt).all()
        return [
            {"id": row.id, "name": row.name, "has_sftp": bool(row.has_sftp)}
            for row in results
        ]

    def toggle_client_status(self, id: int, status: bool):
        self._db.query(Client).where(Client.id == id).update(
            {"still_active": status}, synchronize_session=False
        )

    def add_emails_to_client(self, client_id: int, client_emails: list[str]):

        self._emailrepo.sync_client_emails(client_id, client_emails)

    def create_new_client(self, client_data: ClientRequest) -> Client:
        """
        Creates a client and handles initial email recipient setup cleanly.
        """
        client_dict = client_data.model_dump(exclude={"email"})
        new_client = Client(**client_dict)

        saved_client = self.save(new_client)
        self._db.refresh(saved_client)

        return saved_client

    def get_client_by_id(self, id_val: int) -> Client | None:
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
            .options(
                selectinload(Client.email_recipients),
                selectinload(Client.sftp_services),
            )
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
                    still_active=client.still_active,
                    name=client.name,
                    telefono=str(client.phonenumber) if client.phonenumber else None,
                    email=active_emails,
                    emailService=bool(active_emails),
                    sftService=any(s.is_active for s in client.sftp_services),
                )
            )

        return PaginatedClientResponse(
            data=formatted_clients,
            totalRecords=total_records,
            hasNextPage=has_next_page,
            page=page,
            limit=limit,
        )

    def get_data_of_client(self, client_id: int) -> Client | None:
        return self._db.get(Client, client_id)
