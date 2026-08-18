from typing import TypeVar, Generic, Type
from sqlalchemy.orm import Session

T = TypeVar("T")


class BaseRepository(Generic[T]):
    def __init__(self, db: Session, model: Type[T]):
        self._db = db
        self._model = model

    def save(self, instance: T) -> T:
        self._db.add(instance)
        self._db.commit()
        self._db.refresh(instance)
        return instance

    def delete(self, instance: T) -> None:
        self._db.delete(instance)
        self._db.commit()
