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

    def get_unit_by_number(self, truck: str) -> UnitTruck | None:
        return self._db.query(UnitTruck).filter(UnitTruck.unit_number == truck).first()

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

    def find_by_unit_number(self, unit_number: str) -> UnitTruck | None:
        return (
            self._db.query(UnitTruck)
            .filter(UnitTruck.unit_number == unit_number)
            .first()
        )

    def find_by_tag_id(self, tag_id: str) -> UnitTruck | None:
        return self._db.query(UnitTruck).filter(UnitTruck.tag_id == tag_id).first()

    def create(self, data: UnitIn) -> UnitTruck:
        unit = UnitTruck(
            plates=data.plates,
            unit_number=data.unitNumber,
            state=data.state,
            tag_id=data.tag,
        )
        self._db.add(unit)
        self._db.commit()
        self._db.refresh(unit)
        return unit

    def update_unit(self, unit: UnitTruck, data: UnitIn) -> UnitTruck:
        unit.plates = data.plates
        unit.unit_number = data.unitNumber
        unit.state = data.state
        unit.tag_id = data.tag
        self._db.commit()
        self._db.refresh(unit)
        return unit

    def create_assignment(
        self, unit_id: int, driver_id: int, assigned_by: int, now: datetime
    ) -> UnitAssignment:
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
