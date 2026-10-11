import { IEmployeeService } from "../type/employee.interface";
import { ApiEmployeeService } from "./ApiEmployeeService";

export const employeeService: IEmployeeService = new ApiEmployeeService();
