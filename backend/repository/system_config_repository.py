from sqlalchemy.orm import Session

from model.db_model import SystemConfig


class SystemConfigRepository:
    """Acceso a la configuración global. Solo existe una fila."""

    def __init__(self, db: Session):
        self._db = db

    def get_scac(self) -> str | None:
        row = self._db.query(SystemConfig).first()
        return row.scac if row else None

    def set_scac(self, scac: str) -> str:
        row = self._db.query(SystemConfig).first()
        if row is None:
            row = SystemConfig(scac=scac)
            self._db.add(row)
        else:
            row.scac = scac
        self._db.commit()
        return row.scac
