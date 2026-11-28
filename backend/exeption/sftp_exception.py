class SftpConnectionError(RuntimeError):
    """No se pudo conectar o subir por SFTP; el mensaje es apto para mostrar al usuario."""


class SftpConfigUnreadable(RuntimeError):
    """La configuración SFTP guardada no se puede descifrar (¿cambió FERNET_KEY?)."""

    def __init__(self, config_id: int):
        self.config_id = config_id
        super().__init__(
            f"No se pudo descifrar la configuración SFTP {config_id}. "
            "Verifica que FERNET_KEY sea la misma con la que se guardó."
        )
