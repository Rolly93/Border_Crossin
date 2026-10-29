from typing import override

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from model.db_model import DriverDetails, Employee, UnitAssignment, UnitTruck
from repository import EmployeeRepository
from repository.base_repository import BaseRepository
from schema.employee_schema import OperatorOption, OperatorOptionResponse, TypeUnit


class DriverRepository(BaseRepository[DriverDetails]):
    def __init__(self, db: Session):
        super().__init__(db, DriverDetails)
        self.employee_repo = EmployeeRepository(db)

    @override
    def get_by_id(self, id_val: str | int) -> DriverDetails | None:
        if not (
            driver := (
                self._db.query(DriverDetails)
                .filter(self._model.employee_id == id_val)
                .first()
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Operador no esta en la Base de datos",
            )
        return driver

    def get_drivers_list(self) -> list[OperatorOptionResponse]:

        results = (
            self._db.query(Employee, UnitTruck)
            .join(DriverDetails, Employee.id == DriverDetails.employee_id)
            .outerjoin(
                UnitAssignment,
                (DriverDetails.employee_id == UnitAssignment.driver_id)
                & (UnitAssignment.released_at.is_(None)),
            )
            .outerjoin(UnitTruck, UnitAssignment.unit_id == UnitTruck.id)
            .filter(Employee.role == "operador", Employee.still_employee.is_(True))
            .order_by(Employee.name)
            .all()
        )

        result: list[OperatorOptionResponse] = []
        for employee, unit_truck in results:
            # Inicializamos las variables de la unidad de forma limpia
            unit_number: str | None = None
            type_unit_val: TypeUnit | None = None

            # Si el outerjoin encontró un camión asignado, extraemos sus datos
            if unit_truck is not None:
                unit_number = unit_truck.unit_number
                type_unit_val = TypeUnit(unit_truck.type_unit)

            result.append(
                OperatorOptionResponse(
                    id=employee.id,
                    firstName=f"{employee.name} {employee.last_name}",
                    unit=unit_number,
                    typeUnit=type_unit_val if type_unit_val else None,
                )
            )

        return result
