import re
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from .sftp_schema import SftpConfigurationRequest


class MetricsClientResponse(BaseModel):
    totalClients: int
    emailService: int
    sftpService: int


class ClientOptionResponse(BaseModel):
    id: int
    name: str
    has_sftp: bool = False

    class Config:
        from_attributes = True


class ClientModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[int] = None
    phonenumber: Optional[str]
    sftService: bool
    emailService: bool
    email: Optional[list[EmailStr]] = None
    name: str = Field(..., min_length=2, max_length=100)


class ClientRequest(BaseModel):
    phonenumber: Optional[str] = "N/A"
    sftService: Optional[bool] = False
    emailService: Optional[bool] = False
    email: Optional[list[EmailStr]] = None
    name: str = Field(min_length=2, max_length=100)


class EmailConfigurationRequest(BaseModel):
    email: List[EmailStr]


class ClienteServiceResponse(BaseModel):
    id: int
    name: str
    sftService: SftpConfigurationRequest | None
    emailService: EmailConfigurationRequest | None


class ClientResponse(ClientModel):

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


class ClientPaginateData(BaseModel):
    id: int
    name: str
    telefono: Optional[str]
    still_active: Optional[bool] = False
    sftService: Optional[bool] = False
    emailService: Optional[bool] = False
    email: Optional[List[EmailStr]] | None


class PaginatedClientResponse(BaseModel):
    data: List[ClientPaginateData]
    totalRecords: int
    hasNextPage: bool
    page: int
    limit: int


class ClientNameResponse(BaseModel):
    id: int
    name: str


class ReferenceRuleOut(BaseModel):
    id: int
    operation_type: str
    prefix: str
    reference_length: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
