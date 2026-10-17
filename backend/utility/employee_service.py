from datetime import date, timedelta
from multiprocessing import Value
from os import name

from fastapi import HTTPException, status
from sqlalchemy import select
from model.db_model import DriverDetails, Employee, User
from repository import DriverRepository, EmployeeRepository, UserRepository
from schema.employee_schema import (
    EmployeeCreateUnion,
    EmployeeListItem,
    EmployeeRequestDash,
    PaginatedEmployeeResponse,
)
from schema.token_schema import InitialTokenPayload, TokenPayload
from service.jwt_service import JWTService
from sqlalchemy.orm import Session, joinedload
from stdnum.mx import rfc as rfc_validator


class EmployeeService:

    def __init__(self, db: Session):
        self._db = db
        self._employee_repo = EmployeeRepository(db)
        self._user_repo = UserRepository(db)
        self._driver_repo = DriverRepository(db)
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

    def get_driver_by_id(self, id: int) -> tuple[DriverDetails, Employee]:

        stmt = (
            select(DriverDetails)
            .options(joinedload(DriverDetails.employee_id))
            .join(target=DriverDetails.employee)
            .where(Employee.id == id, Employee.still_employee.is_(True))
        )
        if not (result := self._db.execute(statement=stmt).first()):
            raise ValueError(f"Driver with {id} not found")
        driver_details, employee = result
        return driver_details, employee

    def get_all_employees(
        self, page: int = 1, limit: int = 10
    ) -> PaginatedEmployeeResponse:
        employees, total_records = self._employee_repo.get_paginated(page, limit)
        offset = (page - 1) * limit
        return PaginatedEmployeeResponse(
            data=[
                EmployeeListItem(
                    id=e.id,
                    firstName=e.name,
                    lastName=e.last_name,
                    role=e.role,
                    rfc=e.rfc,
                    hireDate=e.hire_date,
                    stillEmployee=e.still_employee,
                )
                for e in employees
            ],
            totalRecords=total_records,
            hasNextPage=(offset + limit) < total_records,
            page=page,
            limit=limit,
        )

    def _validate_account(self, data: EmployeeCreateUnion) -> None:
        """Valida todo antes de crear el empleado, para no dejar registros a medias."""
        print(data)
        if data.employeeType == "csr" or data.role == "csr":
            # Database validations (repo checks)
            if self._user_repo.get_username(data.username.strip()):
                raise HTTPException(
                    status_code=400, detail="Ese nombre de usuario ya existe"
                )
            if self._user_repo.get_email(str(data.email)):
                raise HTTPException(
                    status_code=400, detail="Ese correo ya está registrado"
                )

        elif data.employeeType == "operador":
            # Database validations (DB checks)
            if data.licenseExpiration <= date.today():
                raise HTTPException(
                    status_code=400, detail="La licencia del operador está vencida"
                )

            if (
                self._db.query(DriverDetails)
                .filter(DriverDetails.license_number == data.licenseNumber.strip())
                .first()
            ):
                raise HTTPException(
                    status_code=400, detail="Ese número de licencia ya está registrado"
                )

            if (
                self._db.query(DriverDetails)
                .filter(DriverDetails.gafet_id == data.gafetId.strip())
                .first()
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Ese gafete ya está asignado a otro operador",
                )

    def _attach_account(
        self,
        employee: Employee,
        data: EmployeeCreateUnion,
        current_user: TokenPayload | InitialTokenPayload,
    ) -> None:
        if data.employeeType == "csr":
            from utility.user_service import UserService

            self._db.add(
                User(
                    username=data.username.strip(),
                    email=str(data.email),
                    hashed_password=UserService.hash_password(data.password),
                    is_admin=data.isAdmin,
                    employee_id=employee.id,
                )
            )
        else:
            self._db.add(
                DriverDetails(
                    employee_id=employee.id,
                    license_number=data.licenseNumber.strip(),
                    expiration_date=data.licenseExpiration,
                    hire_by=int(current_user.sub),
                    gafet_id=data.gafetId.strip() if data.gafetId else None,
                )
            )
        self._db.commit()

    def list_operators(self) -> list[dict[str, str | int]]:
        drivers = self._driver_repo.get_drivers_list()

        return drivers

    def create_employee(self, data: EmployeeCreateUnion) -> Employee:
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

    def register_employee_service(
        self,
        data: EmployeeCreateUnion,
        ip: str,
        current_user: TokenPayload | InitialTokenPayload,
    ) -> EmployeeRequestDash:

        has_users = bool(self._user_repo.get_all_users())

        if not current_user.is_admin and not has_users:
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

        if has_users:
            self._validate_account(data)

        new_employee = self.create_employee(data)
        self._attach_account(new_employee, data, current_user)
        # Misma forma que un renglón de GET /employees/, para agregarlo a la tabla.
        return EmployeeRequestDash(
            status="201",
            detail="Employee registered successfully",
            id=new_employee.id,
            firstName=new_employee.name,
            lastName=new_employee.last_name,
            role=new_employee.role,
            hireDate=new_employee.hire_date,
            stillEmployee=new_employee.still_employee,
            rfc=new_employee.rfc,
            dateOfBirth=new_employee.date_birth,
        )
