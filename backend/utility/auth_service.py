import bcrypt
from schema.user import LoginResponse, LoginRequest
from schema.employee_schema import EmployeeRequest
from config.config import Env
from fastapi import HTTPException, status
from model.db_model import Employee, User
from sqlalchemy.orm import Session


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

    def autenticar(self, email: str, password: str) -> LoginResponse:
        """
        Logic for the /login route.
        """
        # 1. Look for the user in your database
        # user = db.query(User).filter(User.email == email).first()
        if email != self._env.USER_EMAIL and password != self._env.USER_PASSWORD:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales Incorrectas",
            )
        # 2. Verify password (Real logic)
        # if user and self.verify_password(password, user.hashed_password):
        #     return user
        acces_granted = LoginResponse(
            status="200 ok",
            id=1,
            is_admin=False,
            email="test@test.com",
        )
        return acces_granted

    def create_newuser(self, data: LoginRequest, is_admin: int, rfc: str):
        if not data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=" Data Missing"
            )
        """
        Logic for the /usuarios route.
        """

        hashed = self.hash_content(data.password)
        admin = self._db.query(User).filter(User.id == is_admin).first()
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Admin privileges required",
            )
        # db.query(User).filter(User.email == email).first()
        # db_user = User(nombre=nombre, email=email, hashed_password=hashed, rol="admin" if es_admin else "user")
        # db.add(db_user)
        # db.commit()

        return True

    def es_token_valido(self, token: str) -> bool:
        """
        Logic for the /setup/{token} route.
        """
        # For now, just a dummy check
        return token == "secret-setup-token"

    def user_already_exists(self) -> bool:
        """
        firstTime Use
        """

        return False

    def verify_admin(self, admin_id: int) -> int:
        if not admin_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Admin privileges required",
            )
        return admin_id

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
        return new_employee
