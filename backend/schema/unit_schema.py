from datetime import datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from schema.employee_schema import TypeUnit


class UnitState(StrEnum):
    ACTIVA = "ACTIVA"
    MANTENIMIENTO = "MANTENIMIENTO"
    BAJA = "BAJA"


class UnitIn(BaseModel):
    plates: str = Field(min_length=1, max_length=50)
    unitNumber: str = Field(min_length=1, max_length=20)
    status: UnitState = UnitState.ACTIVA
    tag: str | None = Field(default=None, max_length=24)
    typeUnit: Literal[TypeUnit.TRAILER, TypeUnit.UNIT_TRUCK]

    @field_validator("plates", "unitNumber", mode="before")
    @classmethod
    def _strip_upper(cls, value: str) -> str:
        return str(value).strip().upper()

    @field_validator("tag", mode="before")
    @classmethod
    def _clean_tag(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned or None


class UnitOut(BaseModel):
    id: int
    plates: str
    unitNumber: str | None
    status: str
    typeUnit: TypeUnit
    tag: str | None
    driverId: int | None
    driverName: str | None
    assignedAt: datetime | None


class AssignIn(BaseModel):
    driverId: int


class AssignmentOut(BaseModel):
    id: int
    driverId: int
    driverName: str
    assignedBy: int
    assignedAt: datetime
    releasedAt: datetime | None
