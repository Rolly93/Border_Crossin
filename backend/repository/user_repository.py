from sqlalchemy import and_, exists, func, select
from sqlalchemy.orm import Session

from model.db_model import User
from repository.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(db, User)

    def get_email(self, email: str) -> User | None:
        return self._db.query(User).filter(User.email == email).first()

    def get_valid_admin(self, id: int) -> bool:
        return (
            self._db.query(User)
            .filter(exists().where(and_(User.id == id, User.is_admin.is_(True))))
            .scalar()
        )

    def has_any(self) -> bool:
        """¿Existe al menos un usuario? (cierra el alta inicial del admin)."""
        return bool(self._db.scalar(select(exists().where(User.id.isnot(None)))))

    def count_users(self) -> int:
        return self._db.scalar(select(func.count()).select_from(User)) or 0

    def get_all_users(self) -> list[User]:
        return self._db.query(User).all()

    def get_by_employee_id(self, employee_id: int) -> User | None:
        stmt = select(User).where(User.employee_id == employee_id)
        return self._db.execute(stmt).scalar_one_or_none()

    def get_username(self, username: str) -> User | None:
        return self._db.query(User).filter(User.username == username).first()

    def create_user(self, data: User) -> User:
        return self.save(data)
