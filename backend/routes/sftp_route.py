from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from deps.auth import CurrentUser, get_current_user, require_admin
from schema.sftp_schema import SftpConfigIn
from utility.sftp_config_service import SftpConfigService
from utility.sftp_send_service import SftpSendService

router = APIRouter(
    prefix="/sftp", tags=["sftp"], dependencies=[Depends(get_current_user)]
)


class ResendRequest(BaseModel):
    send_ids: list[int] = Field(min_length=1)


@router.get("/sends")
def list_sends(
    client_id: int | None = Query(default=None),
    reference: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
):
    return SftpSendService(db).list_sends(client_id, reference, status_filter)


@router.post("/resend")
def resend(data: ResendRequest, db: Session = Depends(get_db)):
    return SftpSendService(db).resend(data.send_ids)


@router.get("/connection")
def get_connection(
    client_id: int = Query(...),
    db: Session = Depends(get_db),
):
    # Devuelve null cuando el cliente aún no tiene configuración.
    return SftpConfigService(db).get_for_client(client_id)


def _user_id(current_user) -> int:
    # El token de primer uso lleva el RFC como sub; no es un usuario de la tabla user.
    if not current_user.sub.isdigit():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inicia sesión con tu usuario para configurar SFTP",
        )
    return int(current_user.sub)


@router.post("/create", status_code=201, dependencies=[Depends(require_admin)])
def create_connection(
    data: SftpConfigIn,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return SftpConfigService(db).create(data, _user_id(current_user))


@router.put("/update/{config_id}", dependencies=[Depends(require_admin)])
def update_connection(
    config_id: int,
    data: SftpConfigIn,
    db: Session = Depends(get_db),
):
    return SftpConfigService(db).update(config_id, data)


@router.delete("/delete/{config_id}", dependencies=[Depends(require_admin)])
def delete_connection(config_id: int, db: Session = Depends(get_db)):
    return SftpConfigService(db).delete(config_id)
