from datetime import date
from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, EmailStr, Field


class EmployeeBase(BaseModel):
    id: int | None = None


class EmployeeBaseRequest(BaseModel):
    firstName: str
    lastName: str
    role: str
    rfc: str
    dateOfBirth: date


class BoosttrapAdmin(BaseModel):
    status: str
    detail: str
    token: str
    name: str


class EmployeeRequestDash(EmployeeBaseRequest):
    id: int
    status: str
    detail: str
    hireDate: date
    stillEmployee: bool


class EmployeeUserRequest(EmployeeBaseRequest):
    employeeType: Literal["csr"] = "csr"
    username: str
    email: str
    password: str
    isAdmin: bool


class EmployeeDriverRequest(EmployeeBaseRequest):
    employeeType: Literal["operador"] = "operador"
    licenseNumber: str
    licenseExpiration: date
    gafetId: str


class EmployeeRequest(EmployeeBase):
    firstName: str
    lastName: str
    role: str
    rfc: str
    dateOfBirth: date
    employeeType: Literal["csr", "operador"] = "csr"
    # Cargo: cuenta de usuario
    username: str | None
    email: EmailStr | None
    password: str | None
    isAdmin: bool = False
    # Operador: licencia y gafete
    licenseNumber: str | None
    licenseExpiration: date | None
    gafetId: str | None


class TypeUnit(StrEnum):
    UNIT_TRUCK = "unit truck"
    TRAILER = "trailer"


class OperatorOption(BaseModel):
    id: int
    firstName: str
    unit: str | None
    typeUnit: TypeUnit


class OperatorOptionResponse(BaseModel):
    id: int
    firstName: str
    unit: str | None
    typeUnit: TypeUnit | None


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
