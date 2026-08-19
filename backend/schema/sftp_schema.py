from pydantic import BaseModel
from typing import Text


class SftpModel(BaseModel):
    status: Text
    id: int | None = None


class SftpRequest(SftpModel):
    client_id: int


class SftpResponse(SftpRequest):
    host: str
    client_name: str
    username: str
    port: int
    root_folder: str
    remote_folder: str


class SftpConfiRequst(SftpResponse):
    encry_password: str
    configure_by_id: int


class sftpSendFile(SftpResponse):
    retries: int
