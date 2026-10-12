from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from model.db_model import Client, SftpService
from repository.sftp_repository import SftpRepository
from schema.sftp_schema import SftpConfigIn, SftpConfigOut


def _to_out(row: SftpService) -> SftpConfigOut:
    return SftpConfigOut(
        id=row.id,
        idClient=row.client_id,
        host=row.host,
        port=row.port,
        username=row.username,
        password="",
        root_folder=row.root_folder,
        remote_folder=row.remote_folder,
    )


class SftpConfigService:
    def __init__(self, db: Session):
        self._db = db
        self._repo = SftpRepository(db)

    def get_for_client(self, client_id: int) -> SftpConfigOut | None:
        row = self._repo.get_active_config(client_id)
        return _to_out(row) if row else None

    def create(self, data: SftpConfigIn, user_id: int) -> SftpConfigOut:
        if self._db.get(Client, data.idClient) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado",
            )
        if self._repo.get_active_config(data.idClient):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El cliente ya tiene una configuración SFTP activa",
            )
        if not data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La contraseña es obligatoria",
            )
        row = self._repo.create_config(data, data.password, user_id)
        return _to_out(row)

    def update(self, config_id: int, data: SftpConfigIn) -> SftpConfigOut:
        row = self._repo.get_config(config_id)
        if not row or not row.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuración SFTP no encontrada",
            )
        row = self._repo.update_config(row, data, data.password)
        return _to_out(row)

    def delete(self, config_id: int) -> dict:
        row = self._repo.get_config(config_id)
        if not row or not row.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuración SFTP no encontrada",
            )
        self._repo.deactivate_config(row)
        return {"id": config_id, "is_active": False}
