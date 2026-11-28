from datetime import datetime

from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from repository.app_error_repository import AppErrorRepository


class AppErrorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    kind: str
    title: str
    path: str | None
    method: str | None
    count: int
    first_seen: datetime
    last_seen: datetime
    notified_at: datetime | None


class AppErrorService:
    def __init__(self, db: Session):
        self._repo = AppErrorRepository(db)

    def list_latest(self, limit: int = 50) -> list[AppErrorOut]:
        return [AppErrorOut.model_validate(row) for row in self._repo.list_latest(limit)]
