from fastapi import HTTPException, status
from model.db_model import DriverDetails, Employee
from sqlalchemy.orm import Session

from repository import EmployeeRepository
from repository.base_repository import BaseRepository


class DriverRepository(BaseRepository[DriverDetails]):
    def __init__(self, db: Session):
        super().__init__(db, DriverDetails)
        self.employee_repo = EmployeeRepository(db)

    def get_by_id(self, id_val: int) -> DriverDetails | None:
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

    def get_drivers_list(self):

        drivers = (
            self._db.query(DriverDetails)
            .join(Employee, Employee.id == DriverDetails.employee_id)
            .filter(Employee.still_employee.is_(True))
            .order_by(Employee.name)
            .all()
        )

        return [
            {
                "id": driver.employee_id,
                "name": f"{driver.employee.name} {driver.employee.last_name}",
            }
            for driver in drivers
        ]
