from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from exeption.sftp_exception import SftpConfigUnreadable, SftpConnectionError
from model.db_model import SftpService
from repository.cliente_repository import ClienteRepository
from repository.sftp_repository import SftpRepository
from schema.sftp_schema import (
    Sftp_Response_Delte,
    SftpConfigIn,
    SftpConfigOut,
    SftpTestResult,
)
from service import alerting
from service.sftp_service import SFTPService, host_key_fingerprint


class SftpConfigService:
    def __init__(self, db: Session):
        self._repo = SftpRepository(db)
        self._client_repo = ClienteRepository(db)

    def _connection(self, row: SftpService):
        try:
            return self._repo.to_connection(row)
        except SftpConfigUnreadable as err:
            alerting.report("sftp_config_unreadable", str(err), location=f"sftp_config:{row.id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)
            ) from err

    def _to_out(self, row: SftpService) -> SftpConfigOut:
        conn = self._connection(row)
        return SftpConfigOut(
            id=row.id,
            idClient=row.client_id,
            host=conn.host,
            port=row.port,
            username=conn.username,
            password="",  # La contraseña nunca sale del backend.
            root_folder=row.root_folder,
            remote_folder=row.remote_folder,
            is_active=row.is_active,
            host_key_fingerprint=host_key_fingerprint(row.host_key),
        )

    def _get_or_404(self, config_id: int) -> SftpService:
        if not (row := self._repo.get_config(config_id)):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuración SFTP no encontrada",
            )
        return row

    def get_for_client(self, client_id: int) -> SftpConfigOut | None:
        """La configuración activa o, si se desactivó, la última (para reutilizarla)."""
        row = self._repo.get_latest_config(client_id)
        return self._to_out(row) if row else None

    def create(self, data: SftpConfigIn, user_id: int) -> SftpConfigOut:
        if not (client := self._client_repo.get_client_by_id(data.idClient)):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado",
            )
        if self._repo.get_active_config(client.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El cliente ya tiene una configuración SFTP activa",
            )

        # Si hubo una configuración desactivada, se reutiliza en lugar de crear otra.
        if previous := self._repo.get_latest_config(client.id):
            return self._save_existing(previous, data, reactivate=True)

        if not data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La contraseña es obligatoria",
            )
        return self._to_out(self._repo.create_config(data, data.password, user_id))

    def update(self, config_id: int, data: SftpConfigIn) -> SftpConfigOut:
        """Edita; si estaba desactivada, la reactiva."""
        row = self._get_or_404(config_id)
        if not row.is_active:
            active = self._repo.get_active_config(row.client_id)
            if active and active.id != row.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El cliente ya tiene otra configuración SFTP activa",
                )
        return self._save_existing(row, data, reactivate=not row.is_active)

    def _save_existing(self, row: SftpService, data: SftpConfigIn, reactivate: bool) -> SftpConfigOut:
        current_host = self._connection(row).host
        row = self._repo.update_config(
            row, data, data.password, current_host=current_host, reactivate=reactivate
        )
        return self._to_out(row)

    def delete(self, config_id: int) -> Sftp_Response_Delte:
        """Borrado lógico: se conserva para historial y para reactivarla después."""
        row = self._get_or_404(config_id)
        if not row.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuración SFTP no encontrada",
            )
        self._repo.deactivate_config(row)
        return Sftp_Response_Delte(id=config_id, is_active=False)

    def test_connection(self, config_id: int) -> SftpTestResult:
        """Conecta, verifica la carpeta remota y, la primera vez, guarda la llave del servidor."""
        row = self._get_or_404(config_id)
        sftp = SFTPService(self._connection(row))
        try:
            sftp.connect(capture_host_key=row.host_key is None)
            sftp.check_remote_folder()
        except SftpConnectionError as err:
            return SftpTestResult(ok=False, message=str(err), fingerprint=host_key_fingerprint(row.host_key))
        finally:
            sftp.close()

        if sftp.captured_host_key:
            self._repo.save_host_key(row, sftp.captured_host_key)
            message = "Conexión correcta. Se guardó la llave del servidor; los envíos la verificarán."
        else:
            message = "Conexión correcta. La llave del servidor coincide."
        return SftpTestResult(ok=True, message=message, fingerprint=host_key_fingerprint(row.host_key))
