from pydantic import BaseModel, field_validator, Field
from typing import Optional, List
from .sftp_schema import SftpConfigurationRequest
from pydantic import EmailStr
import re


class ClientModel(BaseModel):
    id: Optional[int]
    name: str
    sftService: bool
    emailService: bool

    email: Optional[list[EmailStr]] = None
    name: str = Field(..., min_length=2, max_length=100)

    @field_validator("name")
    @classmethod
    def validate_company_name(cls, v: str) -> str:
        v = re.sub(r"/s+", " ", v)
        if not re.search(r"[a-zA-Z0-9\u00C0-\u024F]", v):
            raise ValueError("Company name must contain letters or numbers")
        return v


class ClientRequest(ClientModel):
    id: int
    """
    Client Request Scshema

    Fields:
    - name (str): Full name of the client
    - email (str): Contact email address
    - sftp_service (bool) : contract SFTP service?
    - email_service (bool) : contract email service?
    """


class EmailConfigurationRequest(BaseModel):
    email: List[EmailStr]


class ClienteServiceResponse(ClientRequest):
    sftService: SftpConfigurationRequest | None
    emailService: EmailConfigurationRequest | None


class ClientResponse(ClientRequest):

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
