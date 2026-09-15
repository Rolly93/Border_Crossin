from sqlalchemy.orm import Session
from repository.base_repository import BaseRepository
from model.db_model import User
from sqlalchemy import and_, exists


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        self._db = db

    def get_email(self, email: str) -> User:
        return self._db.query(User).filter(User.email == email).first()

    def get_valid_admin(self, id: int) -> bool:
        return (
            self._db.query(User)
            .filter(exists().where(and_(User.id == id, User.is_admin == True)))
            .scalar()
        )

    def get_all_users(self) -> list[User] | None:
        return self._db.query(User).first()

    def get_username(self, username: str) -> User:
        return self._db.query(User).filter(User.username == username).first()

    def create_user(self, data: User) -> User:
        db_user = self.save(data)

        return db_user
