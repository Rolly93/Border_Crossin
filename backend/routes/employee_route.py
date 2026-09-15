from typing import Optional, Union
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi_utils.cbv import cbv
from utility.user_service import UserService

from schema.employee_schema import EmployeeRequest
from sqlalchemy.orm import Session
from databse import get_db
from deps.auth import get_client_ip, get_optional_current_user
from service.jwt_service import JWTService
from schema import TokenPayload, InitialTokenPayload

router = APIRouter(prefix="/employees", tags=["employee"])


@cbv(router)
class Employee:

    def __init__(self, db: Session = Depends(get_db)):
        self._auth = UserService(db)
        self.jwt = JWTService()

    @router.post("/create")
    async def register_employee(
        self,
        rq: Request,
        data: EmployeeRequest,
        current_user: Optional[Union[TokenPayload, InitialTokenPayload]] = Depends(
            get_optional_current_user
        ),
    ):
        user_exist = self._auth.user_already_exists()
        ip = get_client_ip(rq)

        if not current_user and not user_exist:
            new_employee = self._auth.create_employee(data)

            initial_token = self.jwt.create_access_token(
                user_id=data.rfc,
                extra_data={
                    "client_ip": ip,
                    "is_first_time": True,
                },
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

        new_employee = self._auth.create_employee(data)

        return {
            "status": "201",
            "detail": "Employee registered successfully",
            "name": new_employee.name,
        }