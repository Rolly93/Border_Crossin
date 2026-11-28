from sqlalchemy.orm import Session

from model.db_model import DriverDetails, Employee
from repository.driver_repository import DriverRepository
from schema.employee_schema import EmployeeDriverRequest


class DriverService:
    def __init__(self, db: Session):
        self._driver_repo = DriverRepository(db)

    def create_driver(
        self, data: EmployeeDriverRequest, employee: Employee, hired_by: int
    ) -> DriverDetails:
        """Agrega los datos de operador al empleado, sin confirmar (lo hace quien llama)."""
        return self._driver_repo.add(
            DriverDetails(
                employee_id=employee.id,
                license_number=data.licenseNumber.strip(),
                expiration_date=data.licenseExpiration,
                gafet_id=data.gafetId.strip(),
                hire_by=hired_by,
            )
        )
