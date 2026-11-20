from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from stdnum.mx import rfc as rfc_validator

from model.db_model import DriverDetails, Employee, User
from repository import DriverRepository, EmployeeRepository, UserRepository
from schema.cargo_schema import CargoTypeEnum
from schema.employee_schema import (
    BoosttrapAdmin,
    EmployeeBaseResponse,
    EmployeeCreateUnion,
    EmployeeRequestDash,
    OperatorOption,
    OperatorOptionResponse,
    PaginatedEmployeeResponse,
)
from schema.token_schema import InitialTokenPayload, TokenPayload
from schema.user_schema import NewUser
from service.jwt_service import JWTService
from utility.driver_service import DriverService
from utility.user_service import UserService


class EmployeeService:

    def __init__(self, db: Session):
        self._db = db
        self._employee_repo = EmployeeRepository(db)
        self._user_repo = UserRepository(db)
        self._driver_repo = DriverRepository(db)
        self._user_service = UserService(self._db)
        self._driver_service = DriverService(self._db)
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
                EmployeeBaseResponse(
                    id=e.id,
                    firstName=e.name,
                    lastName=e.last_name,
                    role=CargoTypeEnum(e.role),
                    rfc=e.rfc,
                    hireDate=e.hire_date,
                    stillEmployee=e.still_employee,
                    dateOfBirth=e.date_birth,
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
        if data.employeeType == CargoTypeEnum.CSR:
            if self._user_repo.get_username(data.username.strip()):
                raise HTTPException(
                    status_code=400, detail="Ese nombre de usuario ya existe"
                )
            if self._user_repo.get_email(str(data.email)):
                raise HTTPException(
                    status_code=400, detail="Ese correo ya está registrado"
                )

        elif data.employeeType == CargoTypeEnum.OPERADOR:
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

    def list_operators(self) -> list[OperatorOption] | list[OperatorOptionResponse]:
        drivers: list[OperatorOption] | list[OperatorOptionResponse] = (
            self._driver_repo.get_drivers_list()
        )

        if not drivers:
            raise (
                HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Not Units Assgined yet!",
                )
            )

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
        ip: str,
        data: EmployeeCreateUnion,
        current_user: TokenPayload | InitialTokenPayload | None,
    ) -> EmployeeRequestDash:

        has_users = bool(self._user_repo.get_all_users())
        is_admin = getattr(current_user, "is_admin", False)

        if has_users and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Only administrators can Register CSR or  Employee Resgistration",
            )
        target_rfc = current_user.sub if not has_users and current_user else data.rfc

        if target_rfc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RFC parameters is Requiere for CSR or  Employee Resgistration",
            )

        if has_users:
            self._validate_account(data)

        new_employee = self.create_employee(data)
        if data.employeeType == CargoTypeEnum.CSR:

            new_user = NewUser(
                rfc=data.rfc,
                role=data.role,
                email=data.email,
                username=data.username,
                password=data.password,
            )

            self._user_service.create_new_user(
                data=new_user, rfc=target_rfc, is_bootstrap=not has_users
            )

        if data.employeeType == CargoTypeEnum.OPERADOR:
            self._driver_service.Register_Employee(data)

        return EmployeeRequestDash(
            status="201",
            detail="Employee registered successfully",
            id=new_employee.id,
            firstName=new_employee.name,
            lastName=new_employee.last_name,
            role=CargoTypeEnum(new_employee.role),
            hireDate=new_employee.hire_date,
            stillEmployee=new_employee.still_employee,
            rfc=new_employee.rfc,
            dateOfBirth=new_employee.date_birth,
        )
