from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import text

from database import engine
from deps.auth import CurrentUser, get_current_user
from deps.service import SystemConfigService

# Health check router (no auth required)
health_router = APIRouter(tags=["health"])

# System config router (requires auth)
router = APIRouter(
    prefix="/system", tags=["system"], dependencies=[Depends(get_current_user)]
)


@health_router.get("/health")
def health_check():
    """Health check endpoint for load balancers and Docker healthchecks."""
    db_status = "disconnected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        pass

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "database": db_status,
    }


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
