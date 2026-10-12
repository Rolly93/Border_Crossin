from typing import Literal, Optional
from pydantic import BaseModel, EmailStr
from datetime import date


class EmployeeBase(BaseModel):
    id: int | None = None


class EmployeeRequest(EmployeeBase):
    firstName: str
    lastName: str
    role: str
    rfc: str
    dateOfBirth: date
    employeeType: Literal["cargo", "operador"] = "cargo"
    # Cargo: cuenta de usuario
    username: Optional[str] = None
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
