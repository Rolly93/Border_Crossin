from typing import override

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from model.db_model import DriverDetails, Employee, UnitAssignment, UnitTruck
from repository import EmployeeRepository
from repository.base_repository import BaseRepository
from schema.employee_schema import OperatorOption


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

    def get_drivers_list(self) -> list[OperatorOption] | OperatorOption:
        drivers = (
            self._db.query(UnitTruck, UnitAssignment, Employee)
            .join(DriverDetails, DriverDetails.employee_id == Employee.id)
            .outerjoin(
                UnitAssignment, UnitAssignment.driver_id == DriverDetails.employee_id
            )
            .outerjoin(UnitTruck, UnitTruck.id == UnitAssignment.unit_id)
            .filter(Employee.role == "operador", Employee.still_employee.is_(True))
            .order_by(Employee.name)
            .all()
        )

        return [
            OperatorOption(
                id=employee.id,
                firstName=f"{employee.name} {employee.last_name}",
                unit=unit_truck.unit_number if unit_truck else None,
                typeUnit=unit_assignment.type_Unit,
            )
            for unit_truck, unit_assignment, employee in drivers
        ]
