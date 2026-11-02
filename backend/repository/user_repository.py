from fastapi import HTTPException, status
from sqlalchemy import and_, exists, select
from sqlalchemy.orm import Session

from model.db_model import DriverDetails, Employee, User
from repository.base_repository import BaseRepository
from repository.driver_repository import DriverRepository
from schema.cargo_schema import CargoTypeEnum


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        self._db = db
        self._driver_repo = DriverRepository(db)

    def get_email(self, email: str) -> User | None:
        return self._db.query(User).filter(User.email == email).first()

    def get_valid_admin(self, id: int) -> bool:
        return (
            self._db.query(User)
            .filter(exists().where(and_(User.id == id, User.is_admin == True)))
            .scalar()
        )

    def get_all_users(self) -> list[User] | None:
        return self._db.query(User).all()

    def get_full_data(self, employee: Employee) -> User:
        stmt = select(User).where(User.employee_id == employee.id)
        user_details = self._db.execute(stmt).scalar_one_or_none()
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User Not Found"
            )
        return user_details

    def _exist_employee(self, id: int) -> Employee | None:
        stmt = select(Employee).where(
            Employee.id == id, Employee.still_employee.is_(True)
        )
        return self._db.execute(stmt).scalar_one_or_none()

    def get_username(self, username: str) -> User | None:
        return self._db.query(User).filter(User.username == username).first()

    def create_user(self, data: User) -> User:
        db_user = self.save(data)
        return db_user

    def get_data_by_id(self, user_id: int) -> tuple[User | DriverDetails, Employee]:
        if not (employee := self._exist_employee(user_id)):
            raise ValueError("Employee not found")

        if employee.role == CargoTypeEnum.OPERADOR:
            drv_details = self._driver_repo.get_full_data(employee)
            return drv_details, employee

        if employee.role == CargoTypeEnum.CSR:
            user_detail = self.get_full_data(employee)
            return user_detail, employee

        raise ValueError(f"Unsupported role type: {employee.role}")
