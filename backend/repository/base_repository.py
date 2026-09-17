from typing import Any, Generic, Optional, Protocol, Type, TypeVar
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError


class HasID(Protocol):
    id: Any


T = TypeVar("T", bound=HasID)


class BaseRepository(Generic[T]):
    def __init__(self, db: Session, model: Type[T]):
        self._db = db
        self._model = model

    def save(self, instance: T) -> T:
        try:
            self._db.add(instance)
            self._db.commit()
            self._db.refresh(instance)
            return instance
        except SQLAlchemyError as err:
            self._db.rollback()
            raise RuntimeError(f"Database save error: {err}") from err

    def delete(self, instance: T) -> None:
        self._db.delete(instance)
        self._db.commit()

    def get_by_id(self, id_val: str | int) -> Optional[T]:
        return self._db.query(self._model).filter(self._model.id == id_val).first()

    def update(
        self, id_val: str | int, obj_in: BaseModel | dict[str, Any]
    ) -> Optional[T]:
        db_obj = self.get_by_id(id_val)
        if not db_obj:
            return None

        if isinstance(obj_in, BaseModel):
            update_data = obj_in.model_dump(exclude_unset=True)
        else:
            update_data = obj_in

        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        self._db.add(db_obj)
        self._db.commit()
        self._db.refresh(db_obj)
        return db_obj
