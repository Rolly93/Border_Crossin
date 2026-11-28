from cryptography.fernet import InvalidToken
from sqlalchemy.orm import Session

from exeption.sftp_exception import SftpConfigUnreadable
from model.db_model import SftpService
from repository.base_repository import BaseRepository
from schema.sftp_schema import SftpConfigIn, SftpConfigurationRequest
from utility.encryption import decrypt_value, encrypt_value


class SftpRepository(BaseRepository[SftpService]):
    """Único lugar que cifra/descifra host, usuario y contraseña SFTP."""

    def __init__(self, db: Session):
        super().__init__(db, SftpService)

    # ------------------------------------------------------------------
    # Lectura
    # ------------------------------------------------------------------

    def to_connection(self, row: SftpService) -> SftpConfigurationRequest:
        """Datos de conexión descifrados (solo para usar en memoria)."""
        try:
            return SftpConfigurationRequest(
                id=row.id,
                client_id=row.client_id,
                host=decrypt_value(row.host),
                username=decrypt_value(row.username),
                password=decrypt_value(row.encrypted_password),
                port=row.port,
                root_folder=row.root_folder,
                remote_folder=row.remote_folder,
                host_key=row.host_key,
            )
        except (InvalidToken, ValueError) as err:
            raise SftpConfigUnreadable(row.id) from err

    def get_sftp_data(self, client_id: int) -> SftpConfigurationRequest | None:
        row = self.get_active_config(client_id)
        return self.to_connection(row) if row else None

    def get_all_sftp_data(self) -> list[SftpService]:
        return self._db.query(SftpService).filter(SftpService.is_active.is_(True)).all()

    def get_active_config(self, client_id: int) -> SftpService | None:
        return (
            self._db.query(SftpService)
            .filter(SftpService.client_id == client_id, SftpService.is_active.is_(True))
            .first()
        )

    def get_latest_config(self, client_id: int) -> SftpService | None:
        """La activa si existe; si no, la última desactivada (para reutilizarla)."""
        return (
            self._db.query(SftpService)
            .filter(SftpService.client_id == client_id)
            .order_by(SftpService.is_active.desc(), SftpService.id.desc())
            .first()
        )

    def get_config(self, config_id: int) -> SftpService | None:
        return self._db.query(SftpService).filter(SftpService.id == config_id).first()

    # ------------------------------------------------------------------
    # Escritura
    # ------------------------------------------------------------------

    def create_config(
        self, data: SftpConfigIn, password: str, configure_by_id: int
    ) -> SftpService:
        row = SftpService(
            client_id=data.idClient,
            host=encrypt_value(data.host),
            port=data.port,
            username=encrypt_value(data.username),
            encrypted_password=encrypt_value(password),
            root_folder=data.root_folder,
            remote_folder=data.remote_folder,
            configure_by_id=configure_by_id,
            is_active=True,
        )
        return self.save(row)

    def update_config(
        self,
        row: SftpService,
        data: SftpConfigIn,
        password: str | None,
        current_host: str,
        reactivate: bool = False,
    ) -> SftpService:
        """Actualiza (y opcionalmente reactiva) una configuración.

        Si cambia el host, la llave guardada ya no aplica y hay que volver a probar.
        """
        if data.host != current_host:
            row.host_key = None
        row.host = encrypt_value(data.host)
        row.port = data.port
        row.username = encrypt_value(data.username)
        row.root_folder = data.root_folder
        row.remote_folder = data.remote_folder
        # Contraseña vacía en la edición = conservar la actual.
        if password:
            row.encrypted_password = encrypt_value(password)
        if reactivate:
            row.is_active = True
        return self.save(row)

    def save_host_key(self, row: SftpService, host_key: str) -> SftpService:
        row.host_key = host_key
        return self.save(row)

    def deactivate_config(self, row: SftpService) -> None:
        # Borrado lógico: sftp_send referencia esta configuración y se puede reactivar.
        row.is_active = False
        self.save(row)
