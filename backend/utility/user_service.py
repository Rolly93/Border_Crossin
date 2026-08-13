import bcrypt
from backend.schema.user_schema import NewUser, LoginRequest
from schema.employee_schema import EmployeeRequest
from config.config import Env
from fastapi import HTTPException, status
from model.db_model import Employee, User
from sqlalchemy.orm import Session

from stdnum.mx import rfc
from repository import UserRepository, EmployeeRepository


class UserService:
    def __init__(self, db: Session):
        self._env = Env()
        self._db = db
        self._user_repo = UserRepository(db)
        self._emplpyee_repo = EmployeeRepository(db)

    def is_valid(self, rfc_validate: str) -> str:

        format_rfc = rfc_validate.strip().upper()

        if not rfc.validate(format_rfc, validate_check_digits=False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"RFC Invalido: {rfc_validate}",
            )

        return format_rfc

    def clean_username(self, dirt_username: str) -> str:
        clean_username = dirt_username.strip()
        return clean_username

    def hash_content(self, toHash: str) -> str:
        """Transforms a plain input into a secure hash."""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(toHash.encode("utf-8"), salt).decode("utf-8")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Checks if the entered password matches the stored hash."""
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )

    def autenticar(self, data: LoginRequest) -> User:
        """
        Logic for the /login route.
        """

        if not data.password or not data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Credencial Missing"
            )
        username = self.clean_username(data.username)

        user = self._user_repo.get_username(username)

        generic_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

        if not user:
            bcrypt.checkpw(b"dummy_password", b"$2b$12$eI8qzx6iLc7g...fakehash...")
            raise generic_error

        if not self.verify_password(data.password, user.hashed_password):
            raise generic_error

        return user

    def _exist_email(self, email: str) -> str:
        clean_email = email.lower().strip()

        exist_user = self._user_repo.get_email(clean_email)
        if exist_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already register"
            )

        return clean_email

    def create_newuser(
        self, data: NewUser, is_admin: int, rfc: str, is_bootstrap: bool = False
    ) -> User:
        if not data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=" Data Missing"
            )
        """
        Logic for the /usuarios route.
        """
        if not is_bootstrap:
            self.verify_admin(is_admin)

        hashed = self.hash_content(data.password)

        clean_rfc = self.is_valid(rfc)
        clean_email = self._exist_email(data.email)
        clean_username = self.clean_username(data.username)
        employee = self._emplpyee_repo.get_employee(clean_rfc)

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee with this RFC does not exist",
            )

        new_user = User(
            username=clean_username,
            email=clean_email,
            hashed_password=hashed,
            is_admin=data.is_admin,
            employee_id=employee.id,
        )

        self._user_repo.create_user(new_user)
        return new_user

    def es_token_valido(self, token: str) -> bool:
        """
        Logic for the /setup/{token} route.
        """
        # For now, just a dummy check
        return token == "secret-setup-token"

    def user_already_exists(self) -> bool:
        any_user = self._user_repo.get_all_users()
        if any_user is not None:
            return True
        return False

    def verify_admin(self, admin_id: int) -> bool:

        is_admin = self._user_repo.get_valid_admin(admin_id)
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Admin privileges required",
            )
        return is_admin

    def create_employee(self, data: EmployeeRequest) -> Employee:

        clean_rfc = self.is_valid(data.rfc_employee)
        existing_employee = (
            self._db.query(Employee).filter(Employee.rfc_employee == clean_rfc).first()
        )

        if existing_employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An employee with this RFC is already registered",
            )

        new_employee = Employee(
            name=data.name,
            last_name=data.last_name,
            role=data.role,
            rfc_employee=clean_rfc,
            still_employee=True,
        )
        self._emplpyee_repo.create_employee(new_employee)
        return new_employee
