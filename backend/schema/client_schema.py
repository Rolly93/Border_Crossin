from pydantic import BaseModel, field_validator
from typing import Text, Optional
from sftp_schema import SftpResponse


class ClientModel(BaseModel):
    id: Optional[int] = None
    name: str
    sftService: bool
    emailService: bool
    email: Optional[list[str]] = None


class ClientResponse(ClientModel):
    name: str
    sftService: bool
    emailService: bool
    email: Optional[list[str]] = None

    class Config:
        from_attributes = True

        @field_validator("email", mode="before")
        @classmethod
        def extract_emails(cls, v, info):
            orm_client = info.data.get("email_recipients") or getattr(
                info, "data", {}
            ).get("email_recipients")
            if isinstance(v, list):
                emails = [item.email for item in v if getattr(item, "is_active", True)]
                return emails if emails else None
            return v


class ClientRequest(ClientModel):
    pass
