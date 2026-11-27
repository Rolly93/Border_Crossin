from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from model.db_model import UnitAssignment, UnitTruck
from repository.unit_repository import UnitRepository
from schema.employee_schema import TypeUnit
from schema.unit_schema import AssignmentOut, UnitIn, UnitOut, UnitState

ACTIVE_STATE = "ACTIVA"


def _error(code: int, detail: str) -> HTTPException:
    return HTTPException(status_code=code, detail=detail)


class UnitService:

    def __init__(self, db: Session):
        self._repo = UnitRepository(db)

    # ---------- helpers ----------
    def _get_unit(self, unit_id: int) -> UnitTruck:
        if not (unit := self._repo.get_by_id(unit_id)):
            raise _error(status.HTTP_404_NOT_FOUND, "Unidad no encontrada")
        return unit

    def _open_assignment(self, unit_id: int) -> UnitAssignment | None:
        return self._repo.get_open_assignment(unit_id)

    def _driver_name(self, driver_id: int) -> str:
        employee = self._repo.get_employee(driver_id)
        return f"{employee.name} {employee.last_name}" if employee else ""

    def _validate_unique(self, data: UnitIn, exclude_id: int | None = None) -> None:
        if self._repo.find_by_unit_number(data.unitNumber, exclude_id=exclude_id):
            raise _error(status.HTTP_400_BAD_REQUEST, "Ese número de unidad ya existe")

        if data.tag and self._repo.find_by_tag_id(data.tag, exclude_id=exclude_id):
            raise _error(
                status.HTTP_400_BAD_REQUEST,
                "Ese tag ya está asignado a otra unidad",
            )

    # ---------- queries ----------
    def get_out(self, unit_id: int) -> UnitOut:
        return next(u for u in self.list_units() if u.id == unit_id)

    def history_item(self, assignment_id: int) -> AssignmentOut:

        if not (assignment := self._repo.get_assignment_by_id(assignment_id)):
            raise _error(status.HTTP_404_NOT_FOUND, "Asignación no encontrada")

        return AssignmentOut(
            id=assignment.id,
            driverId=assignment.driver_id,
            driverName=self._driver_name(assignment.driver_id),
            assignedBy=assignment.assigned_by,
            assignedAt=assignment.assigned_at,
            releasedAt=assignment.released_at,
        )

    def list_units(self) -> list[UnitOut]:
        units = self._repo.get_all()
        result: list[UnitOut] = []
        for unit in units:
            latest_assignment = unit.assignments[0] if unit.assignments else None
            employee = None
            if latest_assignment and latest_assignment.driver:
                employee = latest_assignment.driver.employee

            result.append(
                UnitOut(
                    id=unit.id,
                    plates=unit.plates,
                    unitNumber=unit.unit_number,
                    typeUnit=TypeUnit(unit.type_unit),
                    status=UnitState(unit.state),
                    tag=unit.tag_id,
                    driverId=latest_assignment.driver_id if latest_assignment else None,
                    driverName=(
                        f"{employee.name} {employee.last_name}" if employee else None
                    ),
                    assignedAt=(
                        latest_assignment.assigned_at if latest_assignment else None
                    ),
                )
            )
        return result

    def history(self, unit_id: int) -> list[AssignmentOut]:
        self._get_unit(unit_id)
        rows = self._repo.get_unit_history(unit_id)
        return [
            AssignmentOut(
                id=r.id,
                driverId=r.driver_id,
                driverName=self._driver_name(r.driver_id),
                assignedBy=r.assigned_by,
                assignedAt=r.assigned_at,
                releasedAt=r.released_at,
            )
            for r in rows
        ]

    # ---------- commands ----------
    def create(self, data: UnitIn) -> UnitTruck:
        self._validate_unique(data=data)
        return self._repo.create(data)

    def update(self, unit_id: int, data: UnitIn) -> UnitTruck:
        unit = self._get_unit(unit_id)
        self._validate_unique(data, exclude_id=unit_id)
        return self._repo.update_unit(
            unit, data, release_open_assignment=data.state != ACTIVE_STATE
        )

    def assign(self, unit_id: int, driver_id: int, assigned_by: int) -> UnitAssignment:
        unit = self._get_unit(unit_id)
        if unit.state != ACTIVE_STATE:
            raise _error(
                status.HTTP_409_CONFLICT,
                f"Solo se pueden asignar unidades activas (estado actual: {unit.state})",
            )

        driver = self._repo.get_driver_details(driver_id)
        if not driver or not driver.employee or not driver.employee.still_employee:
            raise _error(status.HTTP_404_NOT_FOUND, "Operador no encontrado o inactivo")

        driver_busy = self._repo.get_open_driver_assignment(driver_id)
        if driver_busy and driver_busy.unit_id != unit_id:
            raise _error(
                status.HTTP_409_CONFLICT,
                "El operador ya tiene una unidad asignada. Libérala primero.",
            )

        return self._repo.assign_driver(
            unit_id, driver_id, assigned_by, datetime.now()
        )

    def release(self, unit_id: int) -> None:
        self._get_unit(unit_id)
        open_a = self._open_assignment(unit_id)
        if not open_a:
            raise _error(
                status.HTTP_409_CONFLICT, "La unidad no tiene operador asignado"
            )
        self._repo.release_assignment(open_a)
