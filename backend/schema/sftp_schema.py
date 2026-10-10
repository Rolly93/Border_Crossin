from typing import Optional

from pydantic import BaseModel, Field


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
