from datetime import UTC, datetime

from sqlalchemy.orm import Session

from model.db_model import Client, Consolidate
from repository.base_repository import BaseRepository
from schema.shipment_shcema import ConsolodateGuideCreate


class ConsolidateRepository(BaseRepository[Consolidate]):
    def __init__(self, db: Session):
        super().__init__(db, model=Consolidate)

    def get_all(self) -> list[Consolidate]:
        """Get all trailers ordered by ID or plates."""
        return self._db.query(Consolidate).order_by(Consolidate.id).all()

    def find_by_guidenumber(self, plates: str, trailer: str) -> Consolidate | None:
        """"""
        return None

    def create_consolidate(
        self,
        consolidate_data: list[ConsolodateGuideCreate] | ConsolodateGuideCreate,
        client: Client,

    ) -> list[Consolidate] | Consolidate:
        """Create and save a new Consolidate Guide instance."""
        is_single = not isinstance(consolidate_data, list)

        items = [consolidate_data] if is_single else consolidate_data

        consolidate = [
            Consolidate(
                client=client,
                guide_number=g.guide_number,
                trip_assigned_id=g.trip_assigned_id ,
                weight=g.weight,
                pieces=g.pieces,
                request_day=datetime.now(UTC),
            )
            for g in items
        ]
        saved = self.save_all(consolidate)

        return saved
