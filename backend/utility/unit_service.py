from typing import Optional
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from model.db_model import DriverDetails, Employee, UnitAssignment, UnitTruck
from schema.unit_schema import AssignmentOut, UnitIn, UnitOut

ACTIVE_STATE = "ACTIVA"


def _error(code: int, detail: str) -> HTTPException:
    return HTTPException(status_code=code, detail=detail)


class UnitService:

    def __init__(self, db: Session):
        self._db = db

    # ---------- helpers ----------
    def _get_unit(self, unit_id: int) -> UnitTruck:
        if unit := self._db.get(UnitTruck, unit_id):
            raise _error(status.HTTP_404_NOT_FOUND, "Unidad no encontrada")
        return unit

    def _open_assignment(self, unit_id: int) -> UnitAssignment | None:
        return (
            self._db.query(UnitAssignment)
            .filter(
                UnitAssignment.unit_id == unit_id, UnitAssignment.released_at.is_(None)
            )
            .first()
        )

    def _driver_name(self, driver_id: int) -> str:
        employee = self._db.get(Employee, driver_id)
        return f"{employee.name} {employee.last_name}" if employee else ""

    def _validate_unique(self, data: UnitIn, exclude_id: int | None) -> None:
        number_q = self._db.query(UnitTruck).filter(
            UnitTruck.unit_number == data.unitNumber
        )
        if exclude_id:
            number_q = number_q.filter(UnitTruck.id != exclude_id)
        if number_q.first():
            raise _error(status.HTTP_400_BAD_REQUEST, "Ese número de unidad ya existe")

        if data.tag:
            tag_q = self._db.query(UnitTruck).filter(UnitTruck.tag_id == data.tag)
            if exclude_id:
                tag_q = tag_q.filter(UnitTruck.id != exclude_id)
            if tag_q.first():
                raise _error(
                    status.HTTP_400_BAD_REQUEST,
                    "Ese tag ya está asignado a otra unidad",
                )

    # ---------- queries ----------
    def get_out(self, unit_id: int) -> UnitOut:
        return next(u for u in self.list_units() if u.id == unit_id)

    def history_item(self, assignment_id: int) -> AssignmentOut:

        if assignment := self._db.get(UnitAssignment, assignment_id):
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
        units = self._db.query(UnitTruck).order_by(UnitTruck.unit_number).all()
        open_rows = (
            self._db.query(UnitAssignment)
            .filter(UnitAssignment.released_at.is_(None))
            .all()
        )
        open_by_unit = {a.unit_id: a for a in open_rows}
        result = []
        for unit in units:
            open_a = open_by_unit.get(unit.id)
            result.append(
                UnitOut(
                    id=unit.id,
                    plates=unit.plates,
                    unitNumber=unit.unit_number,
                    state=unit.state,
                    tag=unit.tag_id,
                    driverId=open_a.driver_id if open_a else None,
                    driverName=self._driver_name(open_a.driver_id) if open_a else None,
                    assignedAt=open_a.assigned_at if open_a else None,
                )
            )
        return result

    def history(self, unit_id: int) -> list[AssignmentOut]:
        self._get_unit(unit_id)
        rows = (
            self._db.query(UnitAssignment)
            .filter(UnitAssignment.unit_id == unit_id)
            .order_by(UnitAssignment.assigned_at.desc(), UnitAssignment.id.desc())
            .all()
        )
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
        self._validate_unique(data)
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

    def update(self, unit_id: int, data: UnitIn) -> UnitTruck:
        unit = self._get_unit(unit_id)
        self._validate_unique(data, exclude_id=unit_id)

        unit.plates = data.plates
        unit.unit_number = data.unitNumber
        unit.state = data.state
        unit.tag_id = data.tag

        # Una unidad que no está activa no puede seguir ligada a un operador.
        if data.state != ACTIVE_STATE and (open_a := self._open_assignment(unit_id)):
            open_a.released_at = datetime.now()

        self._db.commit()
        self._db.refresh(unit)
        return unit

    def assign(self, unit_id: int, driver_id: int, assigned_by: int) -> UnitAssignment:
        unit = self._get_unit(unit_id)
        if unit.state != ACTIVE_STATE:
            raise _error(
                status.HTTP_409_CONFLICT,
                f"Solo se pueden asignar unidades activas (estado actual: {unit.state})",
            )

        driver = self._db.get(DriverDetails, driver_id)
        if not driver or not driver.employee or not driver.employee.still_employee:
            raise _error(status.HTTP_404_NOT_FOUND, "Operador no encontrado o inactivo")

        driver_busy = (
            self._db.query(UnitAssignment)
            .filter(
                UnitAssignment.driver_id == driver_id,
                UnitAssignment.released_at.is_(None),
            )
            .first()
        )
        if driver_busy and driver_busy.unit_id != unit_id:
            raise _error(
                status.HTTP_409_CONFLICT,
                "El operador ya tiene una unidad asignada. Libérala primero.",
            )

        now = datetime.now()

        if previous := self._open_assignment(unit_id):
            if previous.driver_id == driver_id:
                return previous  # ya está asignada a este operador
            previous.released_at = now

        new_assignment = UnitAssignment(
            unit_id=unit_id,
            driver_id=driver_id,
            assigned_by=assigned_by,
            assigned_at=now,
        )
        self._db.add(new_assignment)
        self._db.commit()
        self._db.refresh(new_assignment)
        return new_assignment

    def release(self, unit_id: int) -> None:
        self._get_unit(unit_id)
        open_a = self._open_assignment(unit_id)
        if not open_a:
            raise _error(
                status.HTTP_409_CONFLICT, "La unidad no tiene operador asignado"
            )
        open_a.released_at = datetime.now()
        self._db.commit()
