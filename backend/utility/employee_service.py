from datetime import date
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from stdnum.mx import rfc as rfc_validator

from model.db_model import Employee
from repository import DriverRepository, EmployeeRepository, UserRepository
from schema.cargo_schema import CargoTypeEnum
from schema.employee_schema import (
    EmployeeBaseResponse,
    EmployeeCreateUnion,
    EmployeeDriverResponse,
    EmployeeRequestDash,
    EmployeeResponseUnion,
    EmployeeUserResponse,
    OperatorOptionResponse,
    PaginatedEmployeeResponse,
    TypeUnit,
)
from schema.token_schema import InitialTokenPayload, TokenPayload
from utility.driver_service import DriverService
from utility.user_service import UserService


class EmployeeService:

    def __init__(self, db: Session):
        self._employee_repo = EmployeeRepository(db)
        self._user_repo = UserRepository(db)
        self._driver_repo = DriverRepository(db)
        self._user_service = UserService(db)
        self._driver_service = DriverService(db)

    @staticmethod
    def validate_rfc(rfc_value: str) -> str:
        clean_rfc = rfc_value.strip().upper()
        if not rfc_validator.validate(clean_rfc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid RFC format: {rfc_value}",
            )
        return clean_rfc

    # ------------------------------------------------------------------
    # Consultas
    # ------------------------------------------------------------------

    def get_all_employees(
        self, page: int = 1, limit: int = 10
    ) -> PaginatedEmployeeResponse:
        employees, total_records = self._employee_repo.get_paginated(page, limit)
        offset = (page - 1) * limit
        return PaginatedEmployeeResponse(
            data=[
                EmployeeBaseResponse(
                    id=e.id,
                    firstName=e.name.title(),
                    lastName=str(e.last_name).title(),
                    role=CargoTypeEnum(e.role),
                    rfc=e.rfc.upper(),
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

    def get_employee_info(
        self, id: int, cargoType: Literal["csr", "operador"]
    ) -> EmployeeResponseUnion:
        if not (employee := self._employee_repo.get_active_by_id(id)):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado"
            )
        if employee.role != cargoType:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El empleado {id} no es de tipo '{cargoType}'",
            )

        if cargoType == CargoTypeEnum.CSR:
            if not (user := self._user_repo.get_by_employee_id(employee.id)):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="El empleado no tiene cuenta de usuario",
                )
            return EmployeeUserResponse(
                id=employee.id,
                username=user.username,
                email=user.email,
                isAdmin=user.is_admin,
                password="*******",
                firstName=employee.name,
                lastName=employee.last_name,
                role=CargoTypeEnum(employee.role),
                rfc=employee.rfc,
                dateOfBirth=employee.date_birth,
                hireDate=employee.hire_date,
                stillEmployee=employee.still_employee,
            )

        if not (driver := self._driver_repo.get_by_employee_id(employee.id)):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Operador no encontrado",
            )
        return EmployeeDriverResponse(
            id=employee.id,
            firstName=employee.name,
            lastName=employee.last_name,
            role=CargoTypeEnum(employee.role),
            rfc=employee.rfc,
            dateOfBirth=employee.date_birth,
            hireDate=employee.hire_date,
            stillEmployee=employee.still_employee,
            licenseNumber=driver.license_number,
            licenseExpiration=driver.expiration_date,
            gafetId=driver.gafet_id,
        )

    def list_operators(self) -> list[OperatorOptionResponse]:
        # Sin operadores es un estado válido (lista vacía), no un 404: el
        # formulario de embarque muestra el aviso.
        return [
            OperatorOptionResponse(
                id=employee.id,
                firstName=f"{employee.name} {employee.last_name}",
                unit=unit.unit_number if unit else None,
                typeUnit=TypeUnit(unit.type_unit) if unit and unit.type_unit else None,
            )
            for employee, unit in self._driver_repo.get_active_operators_with_unit()
        ]

    # ------------------------------------------------------------------
    # Alta de empleados
    # ------------------------------------------------------------------

    def _validate_account(self, data: EmployeeCreateUnion, clean_rfc: str) -> None:
        """Valida todo antes de escribir, para no dejar registros a medias."""
        if self._employee_repo.get_employee(clean_rfc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un empleado con ese RFC",
            )

        if data.employeeType == CargoTypeEnum.CSR:
            if self._user_repo.get_username(data.username.strip()):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ese nombre de usuario ya existe",
                )
            if self._user_repo.get_email(data.email.strip().lower()):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ese correo ya está registrado",
                )
            return

        if data.licenseExpiration <= date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La licencia del operador está vencida",
            )
        if self._driver_repo.find_by_license_number(data.licenseNumber.strip()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ese número de licencia ya está registrado",
            )
        if self._driver_repo.find_by_gafet_id(data.gafetId.strip()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ese gafete ya está asignado a otro operador",
            )

    def register_employee_service(
        self,
        ip: str,
        data: EmployeeCreateUnion,
        current_user: TokenPayload | InitialTokenPayload | None,
        created_by_id: int | None = None,
    ) -> EmployeeRequestDash:
        # Alta inicial: mientras no exista ningún usuario se permite, sin sesión,
        # crear la primera cuenta, que siempre es administrador. En cuanto se
        # guarda, ya hay usuarios y este camino queda cerrado para siempre.
        is_bootstrap = not self._user_repo.has_any()

        if is_bootstrap:
            if data.employeeType != CargoTypeEnum.CSR:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La primera cuenta debe ser un administrador (CSR) con usuario",
                )
        elif not getattr(current_user, "is_admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo un administrador puede registrar empleados",
            )

        clean_rfc = self.validate_rfc(data.rfc)
        self._validate_account(data, clean_rfc)

        try:
            employee = self._employee_repo.add(
                Employee(
                    name=data.firstName.strip(),
                    last_name=data.lastName.strip(),
                    role=data.employeeType.value,
                    rfc=clean_rfc,
                    date_birth=data.dateOfBirth,
                    hire_date=data.hireDate,
                    still_employee=data.stillEmployee,
                )
            )

            if data.employeeType == CargoTypeEnum.CSR:
                self._user_service.create_new_user(
                    data=data, employee=employee, is_bootstrap=is_bootstrap
                )
            else:
                # Un operador nunca tiene cuenta ni privilegios; lo registra un admin.
                if created_by_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Inicia sesión como administrador para registrar operadores",
                    )
                self._driver_service.create_driver(
                    data=data, employee=employee, hired_by=created_by_id
                )

            # Dos altas iniciales simultáneas: solo la primera se confirma.
            if is_bootstrap and self._user_repo.count_users() > 1:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El administrador inicial ya fue creado",
                )

            self._employee_repo.commit()
        except Exception:
            self._employee_repo.rollback()
            raise

        return EmployeeRequestDash(
            status="201",
            detail="Employee registered successfully",
            id=employee.id,
            firstName=employee.name,
            lastName=employee.last_name,
            role=CargoTypeEnum(employee.role),
            hireDate=employee.hire_date,
            stillEmployee=employee.still_employee,
            rfc=employee.rfc,
            dateOfBirth=employee.date_birth,
        )
