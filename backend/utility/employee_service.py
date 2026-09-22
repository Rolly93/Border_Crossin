from datetime import timedelta
from typing import Optional, Union

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from stdnum.mx import rfc as rfc_validator

from model.db_model import Employee
from repository import EmployeeRepository, UserRepository
from schema.employee_schema import EmployeeRequest
from schema.token_schema import InitialTokenPayload, TokenPayload
from service.jwt_service import JWTService


class EmployeeService:

    def __init__(self, db: Session):
        self._db = db
        self._employee_repo = EmployeeRepository(db)
        self._user_repo = UserRepository(db)
        self.jwt = JWTService()

    @staticmethod
    def validate_rfc(rfc_value: str) -> str:
        clean_rfc = rfc_value.strip().upper()
        if not rfc_validator.validate(clean_rfc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid RFC format: {rfc_value}",
            )
        return clean_rfc

    def create_employee(self, data: EmployeeRequest) -> Employee:
        clean_rfc = self.validate_rfc(data.rfc)

        if self._employee_repo.get_employee(clean_rfc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An employee with this RFC is already registered",
            )

        new_employee = Employee(
            name=data.firstName,
            last_name=data.lastName,
            role=data.role,
            rfc=clean_rfc,
            still_employee=True,
        )
        self._employee_repo.create_employee(new_employee)
        return new_employee

    def register_employee(
        self,
        data: EmployeeRequest,
        ip: str,
        current_user: Optional[Union[TokenPayload, InitialTokenPayload]],
    ) -> dict:

        has_users = bool(self._user_repo.get_all_users())

        if not current_user and not has_users:
            new_employee = self.create_employee(data)
            initial_token = self.jwt.create_access_token(
                sub=data.rfc,
                ip=ip,
                extra_data={"is_first_time": True},
                expires_delta=timedelta(minutes=15),
            )
            return {
                "status": "201",
                "detail": "Employee registered successfully",
                "token": initial_token,
                "name": new_employee.name,
            }

        if not current_user or not getattr(current_user, "is_admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Authentication required to register additional employees.",
            )

        new_employee = self.create_employee(data)
        return {
            "status": "201",
            "detail": "Employee registered successfully",
            "name": new_employee.name,
        }
