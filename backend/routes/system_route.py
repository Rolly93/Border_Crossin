from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from database import get_db
from deps.auth import get_current_user
from repository.system_config_repository import SystemConfigRepository

router = APIRouter(
    prefix="/system", tags=["system"], dependencies=[Depends(get_current_user)]
)


class ScacRequest(BaseModel):
    scac: str = Field(min_length=2, max_length=4)

    @field_validator("scac")
    @classmethod
    def normalize(cls, value: str) -> str:
        value = value.strip().upper()
        if not value.isalpha():
            raise ValueError("El SCAC solo puede contener letras")
        return value


@router.get("/config")
def get_config(db: Session = Depends(get_db)):
    # scac = null indica que el sistema todavía necesita configurarse.
    return {"scac": SystemConfigRepository(db).get_scac()}


@router.put("/config")
def set_config(data: ScacRequest, db: Session = Depends(get_db)):
    return {"scac": SystemConfigRepository(db).set_scac(data.scac)}
