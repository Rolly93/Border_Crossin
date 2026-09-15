from typing import Optional, Union

import bcrypt
from schema.token_schema import InitialTokenPayload, TokenPayload
from service.jwt_service import JWTService
from config.config import Env
from fastapi import HTTPException, status
from model.db_model import Employee, User
from repository import EmployeeRepository, UserRepository
from schema.employee_schema import EmployeeRequest
from schema.user_schema import LoginRequest, NewUser
from sqlalchemy.orm import Session
from stdnum.mx import rfc
from datetime import timedelta

dummy_password = "my_dummy_password_123".encode("utf-8")
entered_input_1 = "wrong_password_abc".encode("utf-8")


class UserService:

    def __init__(self, db: Session):
        self._env = Env()
        self._db = db
        self._user_repo = UserRepository(db)
        self._employee_repo = EmployeeRepository(db)
        self.jwt = JWTService()

    def is_valid(self, rfc_validate: str) -> str:
        format_rfc = rfc_validate.strip().upper()
        if not rfc.validate(format_rfc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"RFC Invalido: {rfc_validate}",
            )
        return format_rfc

    def clean_username(self, dirt_username: str) -> str:
        return dirt_username.strip()

    def hash_content(self, toHash: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(toHash.encode("utf-8"), salt).decode("utf-8")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )

    def autenticar(self, data: LoginRequest) -> User:
        if not data.password or not data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Credencial Missing",
            )

        username = self.clean_username(data.username)
        user = self._user_repo.get_username(username)

        generic_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

        if not user:
            # Timing attack mitigation: hash a dummy password and discard
            bcrypt.checkpw(b"random", bcrypt.hashpw(b"dummy", bcrypt.gensalt()))
            raise generic_error

        if not self.verify_password(data.password, user.hashed_password):
            raise generic_error

        return user

    def _exist_email(self, email: str) -> str:
        clean_email = email.lower().strip()
        exist_user = self._user_repo.get_email(clean_email)
        if exist_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        return clean_email

    def create_newuser(
        self, data: NewUser, rfc: str | int, is_bootstrap: bool = False
    ) -> User:
        if not data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Data Missing"
            )

        hashed = self.hash_content(data.password)
        clean_rfc = self.is_valid(str(rfc))
        clean_email = self._exist_email(data.email)
        clean_username = self.clean_username(data.username)
        employee = self._employee_repo.get_employee(clean_rfc)

        if not employee and not is_bootstrap:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee with this RFC does not exist",
            )

        # Handle both is_admin and isAdmin gracefully
        is_admin = getattr(data, "is_admin", getattr(data, "isAdmin", False))

        new_user = User(
            username=clean_username,
            email=clean_email,
            hashed_password=hashed,
            is_admin=is_admin,
            employee_id=employee.id if employee else None,
        )

        self._user_repo.create_user(new_user)
        return new_user

    def user_already_exists(self) -> bool:
        users = self._user_repo.get_all_users()
        return bool(users)

    def verify_admin(self, admin_id: int) -> bool:
        is_admin = self._user_repo.get_valid_admin(admin_id)
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Admin privileges required",
            )
        return is_admin

    def login(self, data: LoginRequest, ip: str) -> dict:
        user_data = self.autenticar(data)
        token = self.jwt.create_access_token(
            ip, sub=user_data.id, extra_data={"is_admin": user_data.is_admin}
        )

        return {
            "status": "200 Success",
            "detail": "Login Success",
            "access_token": token,
            "token_type": "bearer",
            "isAdmin": user_data.is_admin,
        }

    def register_new_user(
        self,
        data: NewUser,
        rfc: Optional[str],
        current_user: Optional[Union[TokenPayload, InitialTokenPayload]],
    ) -> dict:
        user_exist = self.user_already_exists()
        is_admin = getattr(current_user, "is_admin", False)

        if user_exist and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can create new users",
            )

        target_rfc = current_user.sub if not user_exist else rfc

        if not target_rfc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "RFC parameter is required for non-bootstrap user" " creation."
                ),
            )

        created_user = self.create_newuser(
            data, rfc=target_rfc, is_bootstrap=not user_exist
        )

        return {
            "status": "201 Created",
            "detail": "User Created Successfully",
            "email": created_user.email,
        }

    def create_employee(self, data: EmployeeRequest) -> Employee:
        clean_rfc = self.is_valid(data.rfc)
        existing_employee = (
            self._db.query(Employee).filter(Employee.rfc == clean_rfc).first()
        )

        if existing_employee:
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
        user_exist = self.user_already_exists()

        if not current_user and not user_exist:
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
                detail=("Authentication required to register additional" " employees."),
            )

        new_employee = self.create_employee(data)

        return {
            "status": "201",
            "detail": "Employee registered successfully",
            "name": new_employee.name,
        }
