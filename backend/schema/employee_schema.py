from datetime import date
from typing import Annotated, Literal, Optional, Union

from pydantic import BaseModel, EmailStr, Field


class EmployeeBase(BaseModel):
    id: int | None = None


class EmployeeBaseRequest(BaseModel):
    firstName: str
    lastName: str
    role: str
    rfc: str
    dateOfBirth: date


class EmployeeUserRequest(EmployeeBaseRequest):
    employeeType: Literal["cargo"] = "cargo"
    username: str
    email: str
    password: str
    isAdmin: bool


class EmployeeDriverRequest(EmployeeBaseRequest):
    employeeType: Literal["operador"] = "operador"
    licenseNumber: str
    licenseExpiration: date
    gafetId: Optional[str] = None


class EmployeeRequest(EmployeeBase):
    firstName: str
    lastName: str
    role: str
    rfc: str
    dateOfBirth: date
    employeeType: Literal["cargo", "operador"] = "cargo"
    # Cargo: cuenta de usuario
    username: str | None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    isAdmin: bool = False
    # Operador: licencia y gafete
    licenseNumber: Optional[str] = None
    licenseExpiration: Optional[date] = None
    gafetId: Optional[str] = None


class OperatorOption(BaseModel):
    id: int
    name: str


class EmployeeListItem(BaseModel):
    id: int
    firstName: str
    lastName: str
    role: str
    rfc: str
    hireDate: date | None = None
    stillEmployee: bool


class PaginatedEmployeeResponse(BaseModel):
    data: list[EmployeeListItem]
    totalRecords: int
    hasNextPage: bool
    page: int
    limit: int


class EmployeeUserResponse(EmployeeUserRequest):
    id: int


class EmployeeDriverResponse(EmployeeDriverRequest):
    id: int


EmployeeResponseUnion = Annotated[
    EmployeeUserResponse | EmployeeDriverResponse,
    Field(discriminator="employeeType"),
]

EmployeeCreateUnion = Annotated[
    EmployeeUserRequest | EmployeeDriverRequest,
    Field(discriminator="employeeType"),
]
