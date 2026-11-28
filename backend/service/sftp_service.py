import base64
import hashlib
import logging
import os
import socket

import paramiko
from paramiko.hostkeys import HostKeyEntry

from exeption.sftp_exception import SftpConnectionError
from schema.sftp_schema import SftpConfigurationRequest

logger = logging.getLogger(__name__)


def host_key_fingerprint(host_key: str | None) -> str | None:
    """Huella 'SHA256:...' (mismo formato que ssh-keygen -l) de "<tipo> <base64>"."""
    if not host_key or " " not in host_key:
        return None
    raw = base64.b64decode(host_key.split(" ", 1)[1])
    digest = base64.b64encode(hashlib.sha256(raw).digest()).decode().rstrip("=")
    return f"SHA256:{digest}"


class _CaptureKeyPolicy(paramiko.MissingHostKeyPolicy):
    """Acepta la llave del servidor y la recuerda (solo en 'Probar conexión')."""

    def __init__(self) -> None:
        self.key: paramiko.PKey | None = None

    def missing_host_key(self, client, hostname, key) -> None:
        self.key = key


class SFTPService:
    """Conexión SFTP solo de salida: sube XML a remote_folder. Nunca lee ni descarga."""

    def __init__(self, config: SftpConfigurationRequest):
        self._host = config.host
        self._port = config.port
        self._user = config.username
        self._password = config.password
        self._remote_folder = config.remote_folder
        self._host_key = config.host_key

        self._client: paramiko.SSHClient | None = None
        self.sftp: paramiko.SFTPClient | None = None
        # Llave capturada en connect(capture_host_key=True), formato "<tipo> <base64>".
        self.captured_host_key: str | None = None

    @property
    def _host_id(self) -> str:
        return self._host if self._port == 22 else f"[{self._host}]:{self._port}"

    def connect(self, capture_host_key: bool = False) -> None:
        client = paramiko.SSHClient()
        capture: _CaptureKeyPolicy | None = None

        if self._host_key:
            entry = HostKeyEntry.from_line(f"{self._host_id} {self._host_key}")
            if entry is None or entry.key is None:
                raise SftpConnectionError("La llave guardada del servidor SFTP no es válida; vuelve a probar la conexión")
            client.get_host_keys().add(self._host_id, entry.key.get_name(), entry.key)
            client.set_missing_host_key_policy(paramiko.RejectPolicy())
        elif capture_host_key:
            capture = _CaptureKeyPolicy()
            client.set_missing_host_key_policy(capture)
        else:
            raise SftpConnectionError(
                "Falta verificar el servidor SFTP: un administrador debe usar 'Probar conexión'"
            )

        try:
            client.connect(
                hostname=self._host,
                port=self._port,
                username=self._user,
                password=self._password,
                timeout=10,
                banner_timeout=10,
                auth_timeout=10,
                look_for_keys=False,
                allow_agent=False,
            )
            self.sftp = client.open_sftp()
            self._client = client
        except paramiko.BadHostKeyException as err:
            client.close()
            raise SftpConnectionError(
                "La llave del servidor SFTP cambió; si el cambio es legítimo, vuelve a probar la conexión"
            ) from err
        except paramiko.AuthenticationException as err:
            client.close()
            raise SftpConnectionError("Usuario o contraseña SFTP incorrectos") from err
        except (socket.timeout, TimeoutError) as err:
            client.close()
            raise SftpConnectionError(f"Tiempo agotado al conectar a {self._host}:{self._port}") from err
        except (OSError, paramiko.SSHException) as err:
            client.close()
            raise SftpConnectionError(f"No se pudo conectar a {self._host}:{self._port}: {err}") from err

        if capture and capture.key is not None:
            self.captured_host_key = f"{capture.key.get_name()} {capture.key.get_base64()}"
        logger.info("Conectado a SFTP %s:%s", self._host, self._port)

    def check_remote_folder(self) -> None:
        if self.sftp is None:
            raise SftpConnectionError("No hay una sesión SFTP activa")
        try:
            self.sftp.stat(self._remote_folder)
        except FileNotFoundError as err:
            raise SftpConnectionError(f"La carpeta remota '{self._remote_folder}' no existe") from err
        except PermissionError as err:
            raise SftpConnectionError(f"Sin permiso para la carpeta remota '{self._remote_folder}'") from err

    def upload_file(self, local_path: str) -> str:
        """Sube local_path a remote_folder y devuelve la ruta remota."""
        if self.sftp is None:
            raise SftpConnectionError("No hay una sesión SFTP activa")
        remote_path = f"{self._remote_folder.rstrip('/')}/{os.path.basename(local_path)}"
        try:
            self.sftp.put(local_path, remote_path)
        except (OSError, paramiko.SSHException) as err:
            raise SftpConnectionError(f"No se pudo subir {os.path.basename(local_path)}: {err}") from err
        return remote_path

    def close(self) -> None:
        if self.sftp:
            self.sftp.close()
        if self._client:
            self._client.close()
        self.sftp = None
        self._client = None
