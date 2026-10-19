from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from deps.auth import CurrentUser, get_current_user, require_admin
from deps.service import SftpServiceConfigSvc, SftpServiceSend
from schema.sftp_schema import SftpConfigIn

router = APIRouter(
    prefix="/sftp", tags=["sftp"], dependencies=[Depends(get_current_user)]
)


class ResendRequest(BaseModel):
    send_ids: list[int] = Field(min_length=1)


@router.get("/sends")
def list_sends(
    service: SftpServiceSend,
    client_id: int | None = Query(default=None),
    reference: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
):
    return service.list_sends(client_id, reference, status_filter)


@router.post("/resend")
def resend(data: ResendRequest, service: SftpServiceSend):
    return service.resend(data.send_ids)


@router.get("/connection")
def get_connection(
    service: SftpServiceConfigSvc,
    client_id: int = Query(...),
):
    # Devuelve null cuando el cliente aún no tiene configuración.
    return service.get_for_client(client_id)


@router.post("/create", status_code=201, dependencies=[Depends(require_admin)])
def create_connection(
    data: SftpConfigIn,
    current_user: CurrentUser,
    service: SftpServiceConfigSvc,
):
    if not current_user.sub.isdigit():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inicia sesión con tu usuario para configurar SFTP",
        )
    return service.create(data, int(current_user.sub))


@router.put("/update/{config_id}", dependencies=[Depends(require_admin)])
def update_connection(
    config_id: int,
    data: SftpConfigIn,
    current_user: CurrentUser,
    service: SftpServiceConfigSvc,
):
    return service.update(config_id, data)


@router.delete("/delete/{config_id}", dependencies=[Depends(require_admin)])
def delete_connection(
    config_id: int,
    current_user: CurrentUser,
    service: SftpServiceConfigSvc,
):
    return service.delete(config_id)
