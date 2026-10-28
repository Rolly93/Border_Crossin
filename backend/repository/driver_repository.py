from typing import override

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from model.db_model import DriverDetails, Employee, UnitAssignment, UnitTruck
from repository import EmployeeRepository
from repository.base_repository import BaseRepository
from schema.employee_schema import OperatorOption, TypeUnit


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

    def get_drivers_list(self) -> list[OperatorOption]:
        drivers = (
            self._db.query(Employee, DriverDetails, UnitAssignment, UnitTruck)
            .outerjoin(
                DriverDetails, DriverDetails.employee_id == Employee.id
            )  # <-- Cambiado a outerjoin
            .outerjoin(
                UnitAssignment, UnitAssignment.driver_id == DriverDetails.employee_id
            )
            .outerjoin(UnitTruck, UnitTruck.id == UnitAssignment.unit_id)
            .filter(Employee.role == "operador", Employee.still_employee.is_(True))
            .order_by(Employee.name)
            .all()
        )
        result: list[OperatorOption] = []
        for row in drivers:
            unit_truck: UnitTruck = row[0]
            unit_assignment: UnitAssignment = row[1]
            employee: Employee = row[2]
            print(employee)
            result.append(
                OperatorOption(
                    id=employee.id,
                    firstName=f"{employee.name} {employee.last_name}",
                    unit=unit_truck.unit_number if unit_truck else None,
                    typeUnit=TypeUnit(unit_truck.type_unit),
                )
            )

        return result
