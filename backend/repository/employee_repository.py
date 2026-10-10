from sqlalchemy import func, select
from sqlalchemy.orm import Session
from model.db_model import Employee


class EmployeeRepository:
    def __init__(self, db: Session):
        self._db = db

    def get_employee(self, rfc: str) -> Employee | None:

        return self._db.query(Employee).filter(Employee.rfc == rfc).first()

    def create_employee(self, data: Employee) -> Employee:
        self._db.add(data)
        self._db.commit()

        self._db.refresh(data)

        return data

    def get_all_users(self) -> list[Employee] | None:
        return self._db.query(Employee).all()

    def get_paginated(self, page: int = 1, limit: int = 10) -> tuple[list[Employee], int]:
        offset = (page - 1) * limit
        total_records = self._db.scalar(select(func.count()).select_from(Employee))
        stmt = (
            select(Employee)
            .order_by(Employee.id)
            .offset(offset)
            .limit(limit)
        )
        return list(self._db.scalars(stmt).all()), total_records or 0
