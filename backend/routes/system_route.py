from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator

from deps.auth import CurrentUser, get_current_user
from deps.service import SystemConfigService

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
def get_config(
    service: SystemConfigService,
    current_user: CurrentUser,
):

    return {"scac": service.get_scac()}


@router.put("/config")
def set_config(
    data: ScacRequest,
    service: SystemConfigService,
    current_user: CurrentUser,
):
    return {"scac": service.set_scac(data.scac)}
