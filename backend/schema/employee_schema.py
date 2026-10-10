from pydantic import BaseModel
from datetime import date


class EmployeeBase(BaseModel):
    id: int | None = None


class EmployeeRequest(EmployeeBase):
    firstName: str
    lastName: str
    role: str
    rfc: str
    dateOfBirth: date


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
