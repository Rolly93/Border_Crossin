from sqlalchemy import func, select
from sqlalchemy.orm import Session

from model.db_model import Employee
from repository.base_repository import BaseRepository


class EmployeeRepository(BaseRepository[Employee]):
    def __init__(self, db: Session):
        super().__init__(db, Employee)

    def get_employee(self, rfc: str) -> Employee | None:
        return self._db.query(Employee).filter(Employee.rfc == rfc).first()

    def get_active_by_id(self, employee_id: int) -> Employee | None:
        stmt = select(Employee).where(
            Employee.id == employee_id, Employee.still_employee.is_(True)
        )
        return self._db.execute(stmt).scalar_one_or_none()

    def create_employee(self, data: Employee) -> Employee:
        return self.save(data)

    def get_paginated(
        self, page: int = 1, limit: int = 10
    ) -> tuple[list[Employee], int]:
        offset = (page - 1) * limit
        total_records = self._db.scalar(select(func.count()).select_from(Employee))
        stmt = select(Employee).order_by(Employee.id).offset(offset).limit(limit)
        return list(self._db.scalars(stmt).all()), total_records or 0
