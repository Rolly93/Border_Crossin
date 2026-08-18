from pydantic import BaseModel


class EmployeeBase(BaseModel):
    status: str | None = None
    id: int | None = None


class EmployeeRequest(EmployeeBase):
    name: str
    last_name: str
    role: str
    rfc_employee: str
