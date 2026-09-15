import bcrypt
from config.config import Env
from fastapi import HTTPException, status
from model.db_model import Employee, User
from repository import EmployeeRepository, UserRepository
from schema.employee_schema import EmployeeRequest
from schema.user_schema import LoginRequest, NewUser
from sqlalchemy.orm import Session
from stdnum.mx import rfc

dummy_password = "my_dummy_password_123".encode("utf-8")
entered_input_1 = "wrong_password_abc".encode("utf-8")
class UserService:

    def __init__(self, db: Session):
        self._env = Env()
        self._db = db
        self._user_repo = UserRepository(db)
        self._employee_repo = EmployeeRepository(db)  # Fixed typo

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
        self, data: NewUser, rfc: str, is_bootstrap: bool = False
    ) -> User:
        if not data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Data Missing"
            )

        hashed = self.hash_content(data.password)
        clean_rfc = self.is_valid(rfc)
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
