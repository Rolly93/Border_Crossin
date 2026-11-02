from datetime import date
from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, EmailStr, Field


class CargoTypeEnum(StrEnum):
    CSR = "csr"
    OPERADOR = "operador"


class EmployeeBase(BaseModel):
    firstName: str
    lastName: str
    role: CargoTypeEnum
    rfc: str
    dateOfBirth: date


class CargoCreate(EmployeeBase):
    employeeType: Literal[CargoTypeEnum.CSR] = CargoTypeEnum.CSR
    username: str
    email: EmailStr
    password: str = Field(..., min_length=8)
    isAdmin: bool = False


class OperadorCreate(EmployeeBase):
    employeeType: Literal[CargoTypeEnum.OPERADOR] = CargoTypeEnum.OPERADOR
    gafetId: str = Field(..., min_length=24, max_length=24)
    licenseNumber: str
    licenseExpiration: date


class DriverDetailsResponse(BaseModel):
    id: int
    license_number: str
    expiration_date: str
    hire_by: str
    gafet_id: str


CargoRequest = Annotated[
    CargoCreate | OperadorCreate, Field(discriminator="employeeType")
]


class AllUnitsRespons(BaseModel):
    id: int = Field(..., gt=0)
    plates: str
    unitNumber: str = Field(..., min_length=2)
    state: str
    tag: str
    driverId: str
    driverName: str
    assignedAt: str
