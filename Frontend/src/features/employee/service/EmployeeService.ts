import { IEmployeeService } from "../type/employee.interface";
import { ApiEmployeeService } from "./ApiEmployeeService";
import { MockEmployeeService } from "./MockEmployeeService";

const ip = import.meta.env.VITE_API_URL || false

export const employeeService: IEmployeeService = ip
  ? new ApiEmployeeService() : new MockEmployeeService();
