from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

UnitState = Literal["ACTIVA", "MANTENIMIENTO", "BAJA"]


class UnitIn(BaseModel):
    plates: str = Field(min_length=1, max_length=50)
    unitNumber: str = Field(min_length=1, max_length=20)
    state: UnitState = "ACTIVA"
    tag: Optional[str] = Field(default=None, max_length=24)

    @field_validator("plates", "unitNumber", mode="before")
    @classmethod
    def _strip_upper(cls, value: str) -> str:
        return str(value).strip().upper()

    @field_validator("tag", mode="before")
    @classmethod
    def _clean_tag(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned or None


class UnitOut(BaseModel):
    id: int
    plates: str
    unitNumber: Optional[str] = None
    state: str
    tag: Optional[str] = None
    driverId: Optional[int] = None
    driverName: Optional[str] = None
    assignedAt: Optional[datetime] = None


class AssignIn(BaseModel):
    driverId: int


class AssignmentOut(BaseModel):
    id: int
    driverId: int
    driverName: str
    assignedBy: int
    assignedAt: datetime
    releasedAt: Optional[datetime] = None
