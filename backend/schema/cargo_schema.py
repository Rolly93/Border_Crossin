from datetime import date
from typing import Annotated, Literal

from pydantic import BaseModel, EmailStr, Field


class EmployeeBase(BaseModel):
    firstName: str
    lastName: str
    role: str
    rfc: str
    dateOfBirth: date


class CargoCreate(EmployeeBase):
    employeeType: Literal["cargo"] = "cargo"
    username: str
    email: EmailStr
    password: str = Field(..., min_length=8)
    isAdmin: bool = False


class OperadorCreate(EmployeeBase):
    employeeType: Literal["operador"] = "operador"
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
