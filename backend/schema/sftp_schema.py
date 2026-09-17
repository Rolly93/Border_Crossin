from pydantic import BaseModel
from typing import Text


class SftpModel(BaseModel):
    id: int | None = None


class SftpRequest(SftpModel):
    client_id: int


class SftpResponse(SftpRequest):
    host: str
    client_id: int
    username: str
    port: int
    root_folder: str
    remote_folder: str


class SftpConfiRequst(SftpResponse):
    encrypted_password: str
    configure_by_id: int


class SftpSendConfig(SftpResponse):
    encrypted_password: str


class SftpInactivateRequest(SftpResponse):
    pass


class SftpConfigurationRequest(SftpConfiRequst):
    pass


class sftpSendFile(SftpResponse):
    retries: int
