from typing import Optional

from pydantic import BaseModel, Field, field_validator


class SftpModel(BaseModel):
    id: Optional[int]


class SftpRequest(SftpModel):
    client_id: int


class SftpResponse(SftpRequest):
    host: str
    client_id: int
    username: str
    port: int
    root_folder: str
    remote_folder: str
    encrypted_password: str


class SftpConfigProcess(SftpResponse): ...


class SftpConfiRequst(SftpResponse):
    configure_by_id: int


class SftpSendConfig(SftpResponse):
    encrypted_password: str


class SftpInactivateRequest(SftpResponse):
    pass


class SftpConfigurationRequest(BaseModel):
    id: int
    host: str
    client_id: int
    username: str
    port: int
    root_folder: str
    remote_folder: str
    encrypted_password: str


class sftpSendFile(SftpResponse):
    retries: int


class SftpConfigIn(BaseModel):
    """Datos de la configuración SFTP que envía el formulario."""

    idClient: int
    host: str = Field(min_length=1, max_length=200)
    port: int = Field(default=22, ge=1, le=65535)
    username: str = Field(min_length=1, max_length=200)
    password: Optional[str] = None
    root_folder: str = Field(min_length=1, max_length=200)
    remote_folder: str = Field(min_length=1, max_length=200)

    @field_validator("host", "username", "root_folder", "remote_folder", mode="before")
    @classmethod
    def strip_and_require(cls, value):
        if isinstance(value, str):
            value = value.strip()
            if not value:
                raise ValueError("no puede estar vacío")
        return value

    @field_validator("host")
    @classmethod
    def host_only(cls, value: str) -> str:
        if any(ch.isspace() for ch in value) or "://" in value or "/" in value:
            raise ValueError(
                "debe ser solo el nombre o IP del servidor, sin http:// ni rutas (ej. sftp.cliente.com)"
            )
        return value


class SftpConfigOut(BaseModel):
    """Configuración que se devuelve al frontend. La contraseña nunca sale."""

    id: int
    idClient: int
    host: str
    port: int
    username: str
    password: str = ""
    root_folder: str
    remote_folder: str
