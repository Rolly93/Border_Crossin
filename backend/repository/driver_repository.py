from sqlalchemy import select
from sqlalchemy.orm import Session

from model.db_model import DriverDetails, Employee, UnitAssignment, UnitTruck
from repository.base_repository import BaseRepository
from schema.cargo_schema import CargoTypeEnum


class DriverRepository(BaseRepository[DriverDetails]):
    def __init__(self, db: Session):
        super().__init__(db, DriverDetails)

    def get_by_employee_id(self, employee_id: int) -> DriverDetails | None:
        stmt = select(DriverDetails).where(DriverDetails.employee_id == employee_id)
        return self._db.execute(stmt).scalar_one_or_none()

    def find_by_license_number(self, license_number: str) -> DriverDetails | None:
        return (
            self._db.query(DriverDetails)
            .filter(DriverDetails.license_number == license_number)
            .first()
        )

    def find_by_gafet_id(self, gafet_id: str) -> DriverDetails | None:
        return (
            self._db.query(DriverDetails)
            .filter(DriverDetails.gafet_id == gafet_id)
            .first()
        )

    def get_active_operators_with_unit(
        self,
    ) -> list[tuple[Employee, UnitTruck | None]]:
        """Operadores activos con la unidad de su asignación abierta (si tienen)."""
        rows = (
            self._db.query(Employee, UnitTruck)
            .join(DriverDetails, Employee.id == DriverDetails.employee_id)
            .outerjoin(
                UnitAssignment,
                (DriverDetails.employee_id == UnitAssignment.driver_id)
                & (UnitAssignment.released_at.is_(None)),
            )
            .outerjoin(UnitTruck, UnitAssignment.unit_id == UnitTruck.id)
            .filter(
                Employee.role == CargoTypeEnum.OPERADOR.value,
                Employee.still_employee.is_(True),
            )
            .order_by(Employee.name)
            .all()
        )
        return [(employee, unit) for employee, unit in rows]
