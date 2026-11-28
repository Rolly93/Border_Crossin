from datetime import timedelta

import bcrypt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from config.config import Env
from model.db_model import Employee, User
from repository import UserRepository
from schema.employee_schema import EmployeeUserRequest
from schema.user_schema import LoginRequest, LoginResponse
from service.jwt_service import JWTService

DUMMY_HASH = "$2b$12$eImiTXuWVxfM37uY4JANjO5E.5R0zJqfG8R6zG1yQ4rZ2gYxK.6Ce"


class UserService:

    def __init__(self, db: Session):
        self._env = Env()
        self._user_repo = UserRepository(db)
        self.jwt = JWTService()

    @staticmethod
    def hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )

    def user_already_exists(self) -> bool:
        return self._user_repo.has_any()

    def authenticate(self, data: LoginRequest) -> User:
        username = data.username.strip()
        user = self._user_repo.get_username(username)
        unauthorized_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

        if not user:
            self.verify_password("dummy_password", DUMMY_HASH)
            raise unauthorized_error
        if not self.verify_password(data.password, user.hashed_password):
            raise unauthorized_error

        return user

    def login(self, data: LoginRequest, ip: str) -> LoginResponse:
        user = self.authenticate(data)

        token = self.jwt.create_access_token(
            ip=ip,
            sub=user.id,
            extra_data={
                "is_admin": user.is_admin,
                "is_first_time": False,
                "email": user.email,
            },
            expires_delta=timedelta(hours=8),
        )
        return LoginResponse(
            status="200 Success",
            detail="Login successful",
            access_token=token,
            token_type="bearer",
            isAdmin=user.is_admin,
        )

    def create_new_user(
        self, data: EmployeeUserRequest, employee: Employee, is_bootstrap: bool = False
    ) -> User:
        """Crea la cuenta del empleado, sin confirmar (lo hace quien llama).

        La primera cuenta del sistema (alta inicial) siempre es administrador.
        La unicidad de usuario/correo ya se validó antes de crear al empleado.
        """
        return self._user_repo.add(
            User(
                username=data.username.strip(),
                email=data.email.strip().lower(),
                hashed_password=self.hash_password(data.password),
                is_admin=bool(data.isAdmin) or is_bootstrap,
                employee_id=employee.id,
            )
        )
