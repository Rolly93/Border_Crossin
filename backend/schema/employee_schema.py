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
