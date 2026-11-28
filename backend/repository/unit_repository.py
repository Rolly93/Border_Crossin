from datetime import datetime

from sqlalchemy.orm import Session

from model.db_model import DriverDetails, Employee, UnitAssignment, UnitTruck
from repository.base_repository import BaseRepository
from schema.unit_schema import UnitIn


class UnitRepository(BaseRepository[UnitTruck]):
    def __init__(self, db: Session):
        super().__init__(db, model=UnitTruck)

    def get_by_id(self, id_val: int) -> UnitTruck | None:
        return self._db.get(UnitTruck, id_val)

    def get_all(self) -> list[UnitTruck]:
        return self._db.query(UnitTruck).order_by(UnitTruck.unit_number).all()

    def get_open_assignment(self, unit_id: int) -> UnitAssignment | None:
        return (
            self._db.query(UnitAssignment)
            .filter(
                UnitAssignment.unit_id == unit_id, UnitAssignment.released_at.is_(None)
            )
            .first()
        )

    def get_all_open_assignments(self) -> list[UnitAssignment]:
        return (
            self._db.query(UnitAssignment)
            .filter(UnitAssignment.released_at.is_(None))
            .all()
        )

    def get_unit_by_driver(self, driver_id: int | str) -> UnitTruck | None:
        """Unidad que el operador tiene asignada actualmente (asignación abierta)."""
        if not str(driver_id).strip().isdigit():
            return None
        return (
            self._db.query(UnitTruck)
            .join(UnitTruck.assignments)
            .filter(
                UnitAssignment.driver_id == int(driver_id),
                UnitAssignment.released_at.is_(None),
            )
            .order_by(UnitAssignment.assigned_at.desc())
            .first()
        )

    def get_assignment_by_id(self, assignment_id: int) -> UnitAssignment | None:
        return self._db.get(UnitAssignment, assignment_id)

    def get_unit_history(self, unit_id: int) -> list[UnitAssignment]:
        return (
            self._db.query(UnitAssignment)
            .filter(UnitAssignment.unit_id == unit_id)
            .order_by(UnitAssignment.assigned_at.desc(), UnitAssignment.id.desc())
            .all()
        )

    def get_employee(self, employee_id: int) -> Employee | None:
        return self._db.get(Employee, employee_id)

    def get_driver_details(self, driver_id: int) -> DriverDetails | None:
        return self._db.get(DriverDetails, driver_id)

    def get_open_driver_assignment(self, driver_id: int) -> UnitAssignment | None:
        return (
            self._db.query(UnitAssignment)
            .filter(
                UnitAssignment.driver_id == driver_id,
                UnitAssignment.released_at.is_(None),
            )
            .first()
        )

    def find_by_unit_number(
        self, unit_number: str, exclude_id: int | None = None
    ) -> UnitTruck | None:
        query = self._db.query(UnitTruck).filter(
            UnitTruck.unit_number == unit_number
        )
        if exclude_id is not None:
            query = query.filter(UnitTruck.id != exclude_id)
        return query.first()

    def find_by_tag_id(
        self, tag_id: str, exclude_id: int | None = None
    ) -> UnitTruck | None:
        query = self._db.query(UnitTruck).filter(UnitTruck.tag_id == tag_id)
        if exclude_id is not None:
            query = query.filter(UnitTruck.id != exclude_id)
        return query.first()

    def create(self, data: UnitIn) -> UnitTruck:
        unit = UnitTruck(
            plates=data.plates,
            unit_number=data.unitNumber,
            type_unit=data.typeUnit,
            state=data.state,
            tag_id=data.tag,
        )
        self._db.add(unit)
        self._db.commit()
        self._db.refresh(unit)
        return unit

    def update_unit(
        self,
        unit: UnitTruck,
        data: UnitIn,
        release_open_assignment: bool = False,
    ) -> UnitTruck:
        unit.plates = data.plates
        unit.unit_number = data.unitNumber
        unit.state = data.state
        unit.tag_id = data.tag
        unit.type_unit = data.typeUnit
        if release_open_assignment:
            open_assignment = self.get_open_assignment(unit.id)
            if open_assignment:
                open_assignment.released_at = datetime.now()
        self._db.commit()
        self._db.refresh(unit)
        return unit

    def release_assignment(
        self, assignment: UnitAssignment, when: datetime | None = None
    ) -> UnitAssignment:
        assignment.released_at = when or datetime.now()
        self._db.commit()
        self._db.refresh(assignment)
        return assignment

    def assign_driver(
        self, unit_id: int, driver_id: int, assigned_by: int, now: datetime
    ) -> UnitAssignment:
        if previous := self.get_open_assignment(unit_id):
            if previous.driver_id == driver_id:
                return previous
            previous.released_at = now

        assignment = UnitAssignment(
            unit_id=unit_id,
            driver_id=driver_id,
            assigned_by=assigned_by,
            assigned_at=now,
        )
        self._db.add(assignment)
        self._db.commit()
        self._db.refresh(assignment)
        return assignment

    def commit(self) -> None:
        self._db.commit()
