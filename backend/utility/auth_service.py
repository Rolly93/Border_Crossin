import bcrypt
from schema.user import LoginResponse, NewUser, LoginRequest
from schema.employee_schema import EmployeeRequest
from config.config import Env
from fastapi import HTTPException, status
from model.db_model import Employee, User
from sqlalchemy.orm import Session
from sqlalchemy import and_, exists


class AuthService:
    def __init__(self, db: Session):
        self._env = Env()
        self._db = db
        pass

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
        username = data.username.strip().lower()
        user = self._db.query(User).filter(User.username == username).first()
        generic_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

        if not user:
            bcrypt.checkpw(b"dummy_password", b"$2b$12$eI8qzx6iLc7g...fakehash...")
            raise generic_error

        if self.verify_password(data.password, user.hashed_password):
            raise generic_error

        return user

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
        clean_email = data.email.lower().strip()
        clean_rfc = rfc.strip().upper()

        existing_user = self._db.query(User).filter(User.email == clean_email).first()
        employee = (
            self._db.query(Employee).filter(Employee.rfc_employee == clean_rfc).first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already register"
            )
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee with this RFC does not exist",
            )

        db_user = User(
            username=data.username,
            email=clean_email,
            password=hashed,
            is_admin=data.is_admin,
            employee_id=employee.id,
        )
        self._db.add(db_user)
        self._db.commit()
        self._db.refresh(db_user)

        return db_user

    def es_token_valido(self, token: str) -> bool:
        """
        Logic for the /setup/{token} route.
        """
        # For now, just a dummy check
        return token == "secret-setup-token"

    def user_already_exists(self) -> bool:
        any_user = self._db.query(User).first()
        if any_user is not None:
            return True

        return False

    def verify_admin(self, admin_id: int) -> bool:

        is_admin = (
            self._db.query(User)
            .filter(exists().where(and_(User.id == admin_id, User.is_admin == True)))
            .scalar()
        )
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Admin privileges required",
            )
        return is_admin

    def create_employee(self, data: EmployeeRequest) -> Employee:
        existing_employee = None  # qury to check if rfc already exist

        if existing_employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An employee with this RFC is already registered",
            )
        clean_rfc = data.rfc_employee.strip().upper()

        new_employee = Employee(
            name=data.name,
            last_name=data.last_name,
            role=data.role,
            rfc_employee=clean_rfc,
            still_employee=True,
        )
        self._db.add(new_employee)
        self._db.commit()
        self._db.refresh(new_employee)
        return new_employee
