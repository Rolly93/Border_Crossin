from datetime import date

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from model.db_model import DriverDetails
from repository.driver_repository import DriverRepository
from repository.employee_repository import EmployeeRepository
from schema.employee_schema import EmployeeDriverRequest
from service.jwt_service import JWTService
from utility.user_service import UserService

from stdnum.mx import rfc as rfc_validator

class DriverService :

    def __init__(self, db: Session):
        self._db = db
        self._employee_repo = EmployeeRepository(db)

        self._driver_repo = DriverRepository(db)
        self._user_service = UserService(self._db)
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

    def Register_Employee(self, driver_details: EmployeeDriverRequest)->DriverDetails:
        today = date.today()

        if not (e := self._employee_repo.get_employee(driver_details.rfc)):
            raise HTTPException(
          status_code = status.HTTP_404_NOT_FOUND,
          detail='Employee Not Found')

        if driver_details.licenseExpiration <= today:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver license is expired or expires today",
            )

        new_driver = DriverDetails(
            employee_id=e.id,
            license_number=driver_details.licenseNumber,
            expiration_date=driver_details.licenseExpiration,
            gafet_id=driver_details.gafetId,
        )
        return self._driver_repo.save(new_driver)
