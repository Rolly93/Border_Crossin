import { BaseMockService } from "@/components/service/BaseMockService";
import { IEmployee, IEmployeeService } from "../type/employee.interface";

const INITIAL_EMPLOYEES: IEmployee[] = [];

export class MockEmployeeService
  extends BaseMockService<IEmployee>
  implements IEmployeeService {
  constructor() {
    super(INITIAL_EMPLOYEES);
  }
}