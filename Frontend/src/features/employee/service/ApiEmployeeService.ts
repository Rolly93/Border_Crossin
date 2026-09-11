import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { IEmployee, IEmployeeService } from "../type/employee.interface";

export class ApiEmployeeService
  extends BaseCrudApiService<IEmployee>
  implements IEmployeeService {
  constructor() {
    super('/employees');
  }
}