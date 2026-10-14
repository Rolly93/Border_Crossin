from typing import List, Optional
from enum import Enum
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload, joinedload
from fastapi import HTTPException, status

from schema.cargo_schema import DriverDetailsResponse
from model.db_model import DriverDetails, Employee
from repository.base_repository import BaseRepository
from repository import EmployeeRepository


class DriverRepository(BaseRepository[DriverDetails]):
    def __init__(self, db: Session):
        super().__init__(db, DriverDetails)
        self.employee_repo = EmployeeRepository(db)

    def get_by_id(self, id_val: int) -> DriverDetails:
        driver = (
            self._db.query(DriverDetails)
            .filter(self._model.employee_id == id_val)
            .first()
        )
        if not driver:
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
