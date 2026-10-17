from sqlalchemy import and_, exists, select
from sqlalchemy.orm import Session, joinedload

from model.db_model import Employee, User
from repository.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        self._db = db

    def get_email(self, email: str) -> User | None:
        return self._db.query(User).filter(User.email == email).first()

    def get_valid_admin(self, id: int) -> bool:
        return (
            self._db.query(User)
            .filter(exists().where(and_(User.id == id, User.is_admin == True)))
            .scalar()
        )

    def get_all_users(self) -> list[User] | None:
        return self._db.query(User).all()

    def get_username(self, username: str) -> User | None:
        return self._db.query(User).filter(User.username == username).first()

    def create_user(self, data: User) -> User:
        db_user = self.save(data)
        return db_user

    def get_user_by_id(self, user_id: int) -> tuple[User, Employee]:
        stmt = (
            select(User, Employee)
            .join(Employee, User.employee_id == Employee.id, isouter=True)
            .where(User.id == user_id, Employee.still_employee.is_(True))
        )
        if not (result := self._db.execute(statement=stmt).first()):
            raise ValueError(f"User with {user_id} not found")
        user, employee = result
        return user, employee
