from datetime import datetime, timezone
from typing import Any
from sqlalchemy.orm import Session
from model.db_model import Trailer
from repository.base_repository import BaseRepository
from pydantic import BaseModel


class TrailerRepository(BaseRepository[Trailer]):
    def __init__(self, db: Session):
        super().__init__(db, model=Trailer)

    def get_all(self) -> list[Trailer]:
        """Get all trailers ordered by ID or plates."""
        return self._db.query(Trailer).order_by(Trailer.id).all()

    def find_by_trailer(self, plates: str, trailer: str) -> Trailer | None:
        """Find a trailer by its plates."""
        return (
            self._db.query(Trailer)
            .filter(Trailer.plates == plates, Trailer.trailer_number == trailer)
            .first()
        )

    def get_by_state(self, state: str) -> list[Trailer]:
        """Get trailers filtered by a specific state."""
        return self._db.query(Trailer).filter(Trailer.state == state).all()

    def create_trailer(
        self, plates: str, state: str, trailer_number: str, seal: str = "N/A"
    ) -> Trailer:
        """Create and save a new trailer instance."""
        trailer = Trailer(
            plates=plates,
            state=state,
            trailer_number=trailer_number,
            seal=seal,
            assigned_day=datetime.now(timezone.utc),
        )
        return self.save(trailer)  # Inherited from BaseRepository

    def update_trailer(
        self, trailer: Trailer, data: BaseModel | dict[str, Any]
    ) -> Trailer:
        """Update trailer attributes directly from a schema or dictionary."""
        if isinstance(data, BaseModel):
            update_data = data.model_dump(exclude_unset=True)
        else:
            update_data = data

        for field, value in update_data.items():
            if hasattr(trailer, field):
                setattr(trailer, field, value)

        self._db.commit()
        self._db.refresh(trailer)
        return trailer
