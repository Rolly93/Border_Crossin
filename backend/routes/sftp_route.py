from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from deps.auth import get_current_user
from utility.sftp_send_service import SftpSendService

router = APIRouter(
    prefix="/sftp", tags=["sftp"], dependencies=[Depends(get_current_user)]
)


class ResendRequest(BaseModel):
    send_ids: List[int] = Field(min_length=1)


@router.get("/sends")
def list_sends(
    client_id: Optional[int] = Query(default=None),
    reference: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
):
    return SftpSendService(db).list_sends(client_id, reference, status_filter)


@router.post("/resend")
def resend(data: ResendRequest, db: Session = Depends(get_db)):
    return SftpSendService(db).resend(data.send_ids)
