from datetime import timedelta
from typing import Literal, Optional, Union

import bcrypt
from config.config import Env
from fastapi import HTTPException, status
from model.db_model import User
from repository import EmployeeRepository, UserRepository
from schema.employee_schema import (
    EmployeeDriverResponse,
    EmployeeResponseUnion,
    EmployeeUserResponse,
)
from schema.token_schema import InitialTokenPayload, TokenPayload
from schema.user_schema import LoginRequest, NewUser
from service.jwt_service import JWTService
from sqlalchemy.orm import Session
from stdnum.mx import rfc as rfc_validator

from utility.employee_service import EmployeeService

DUMMY_HASH = "$2b$12$eImiTXuWVxfM37uY4JANjO5E.5R0zJqfG8R6zG1yQ4rZ2gYxK.6Ce"


class UserService:

    def __init__(self, db: Session):
        self._env = Env()
        self._db = db
        self._user_repo = UserRepository(db)
        self._employee_repo = EmployeeRepository(db)
        self._employee_service = EmployeeService(db)
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

    @staticmethod
    def hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )

    def _validate_unique_email(self, email: str) -> str:
        clean_email = email.strip().lower()
        if self._user_repo.get_email(clean_email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            )
        return clean_email

    def user_already_exists(self) -> bool:
        return bool(self._user_repo.get_all_users())

    def authenticate(self, data: LoginRequest) -> User:
        username = data.username.strip()
        user = self._user_repo.get_username(username)
        unauthorized_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
        print(user)

        if not user:
            self.verify_password("dummy_password", DUMMY_HASH)
            raise unauthorized_error
        if not self.verify_password(data.password, user.hashed_password):
            raise unauthorized_error

        return user

    def login(self, data: LoginRequest, ip: str) -> dict:
        user = self.authenticate(data)

        token = self.jwt.create_access_token(
            ip=ip,
            sub=user.id,
            extra_data={
                "is_admin": user.is_admin,
                "is_first_time": False,
            },
            expires_delta=timedelta(hours=8),
        )
        return {
            "status": "200 Success",
            "detail": "Login successful",
            "access_token": token,
            "token_type": "bearer",
            "isAdmin": user.is_admin,
        }

    def create_new_user(
        self, data: NewUser, rfc: str, is_bootstrap: bool = False
    ) -> User:
        clean_rfc = self.validate_rfc(rfc)
        clean_email = self._validate_unique_email(data.email)
        clean_username = data.username.strip()

        employee = self._employee_repo.get_employee(clean_rfc)
        if not employee and not is_bootstrap:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee with this RFC does not exist",
            )

        is_admin = getattr(data, "is_admin", getattr(data, "isAdmin", False))

        new_user = User(
            username=clean_username,
            email=clean_email,
            hashed_password=self.hash_password(data.password),
            is_admin=is_admin,
            employee_id=employee.id if employee else None,
        )

        self._user_repo.create_user(new_user)
        return new_user

    def register_new_user(
        self,
        data: NewUser,
        rfc: Optional[str],
        current_user: Optional[Union[TokenPayload, InitialTokenPayload]],
    ) -> dict:
        has_users = self.user_already_exists()
        is_admin = getattr(current_user, "is_admin", False)

        if has_users and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can create new users",
            )

        target_rfc = current_user.sub if not has_users and current_user else rfc

        if not target_rfc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RFC parameter is required for user creation.",
            )

        created_user = self.create_new_user(
            data, rfc=target_rfc, is_bootstrap=not has_users
        )

        return {
            "status": "201 Created",
            "detail": "User created successfully",
            "email": created_user.email,
        }

    def get_employee_info(
        self, id: int, cargoType: Literal["cargo", "operador"]
    ) -> EmployeeResponseUnion:
        em_re = None

        if cargoType == "cargo":
            em_re = self._user_repo.get_user_by_id(id)
            return EmployeeUserResponse(
                id=em_re.id,
                username=em_re.username,
                email=em_re.email,
                isAdmin=em_re.is_admin,
                employeeId=em_re.employee_id,
            )

        if cargoType == "operador":
            em_re = self._employee_service.get_driver_by_id(id)
            return EmployeeDriverResponse(
                id=em_re.id,
                licenseNumber=em_re.license_number,
                expirationDate=em_re.expiration_date,
                gafetId=em_re.gafet_id,
            )

        return em_re
