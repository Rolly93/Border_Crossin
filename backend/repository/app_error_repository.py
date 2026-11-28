from datetime import datetime

from sqlalchemy.orm import Session

from model.db_model import AppError
from repository.base_repository import BaseRepository


class AppErrorRepository(BaseRepository[AppError]):
    def __init__(self, db: Session):
        super().__init__(db, AppError)

    def find_since(self, fingerprint: str, since: datetime) -> AppError | None:
        return (
            self._db.query(AppError)
            .filter(AppError.fingerprint == fingerprint, AppError.last_seen >= since)
            .order_by(AppError.id.desc())
            .first()
        )

    def bump(self, row: AppError, now: datetime) -> AppError:
        row.count += 1
        row.last_seen = now
        return self.save(row)

    def mark_notified(self, row: AppError, now: datetime) -> AppError:
        row.notified_at = now
        return self.save(row)

    def list_latest(self, limit: int = 50) -> list[AppError]:
        return self._db.query(AppError).order_by(AppError.last_seen.desc()).limit(limit).all()
