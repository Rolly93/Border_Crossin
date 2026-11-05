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
    id: int
    name: str = Field(..., min_length=2, max_length=100)
    phonenumber: str | None
    sftService: bool
    emailService: bool
    email: list[EmailStr] | None = None
    still_active: bool = True
    model_config = ConfigDict(from_attributes=True)


class ClientRequest(BaseModel):
    phonenumber: str | None = "N/A"
    sftService: bool = False
    emailService: bool = False
    email: list[EmailStr] | None = None
    name: str = Field(min_length=2, max_length=100)


class EmailConfigurationRequest(BaseModel):
    email: list[EmailStr]


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


class ClientPaginateData(ClientModel): ...


class PaginatedClientResponse(BaseModel):
    data: list[ClientPaginateData]
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
    reference_length: int | None = None

    model_config = ConfigDict(from_attributes=True)
