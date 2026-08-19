from sqlalchemy.orm import Session
from model.db_model import Employee


class EmployeeRepository:
    def __init__(self, db: Session):
        self._db = db

    def get_employee(self, rfc: str) -> Employee | None:

        return self._db.query(Employee).filter(Employee.rfc_employee == rfc).first()

    def create_employee(self, data: Employee) -> Employee:
        db_employee = Employee(**data.dump_json())
        self._db.add(db_employee)
        self._db.commit()

        self._db.refresh(db_employee)

        return db_employee
