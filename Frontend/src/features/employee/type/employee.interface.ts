import { IBaseService, PaginatedResponse } from "@/components/service/IBaseService";
import { extend } from "dayjs";


export interface IEmployeeRequest {

  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  rfc: string;
  role: string;
  hireDate?: string;
  token?: string

}

export interface IEmployeeResponse extends IEmployeeRequest {
  id?: number;
}

export interface IEmployeeFormsValues extends IEmployeeRequest {
}

export interface EmployeeFormProps {
  onSuccess?: () => void;
  onSetRfc?: (rfc: string) => void;
  onClose?: () => void
  employee?: IEmployeeRequest
}

/** Tipo de empleado: cargo (tiene cuenta de usuario) u operador (tiene licencia y unidad). */
export type EmployeeType = "csr" | "operador";

/** Payload que envía el formulario "Nuevo empleado" al endpoint POST /employees/create. */
export interface INewEmployeeRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  rfc: string;
  role: string;
  employeeType: EmployeeType;
  // cargo
  username?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
  // operador
  licenseNumber?: string;
  licenseExpiration?: string; // YYYY-MM-DD
  gafetId?: string;
}
export interface IEMployeeBaseResponse {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  rfc: string;
  role: string;
  employeeType: EmployeeType;
}



export interface IEmployeeUserResponse extends IEmployeeRequest {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}


export interface IEmployeeDriverResponse extends IEmployeeRequest {
  licenseNumber: string;
  licenseExpiration: string;
  gafetId: string;
}


export interface IOperatorOption {
  id: number;
  name: string;
}

export interface IEmployeeFormRequest extends INewEmployeeRequest {
  id?: number;
}

export type TEmployeeResponseMap = {
  cargo: IEmployeeUserResponse;
  operador: IEmployeeDriverResponse

}

export interface IEmployeeService extends IBaseService<IEmployeeResponse, IEmployeeRequest> {
  getPaginated(page: number, limit: number): Promise<PaginatedResponse<IEmployeeResponse>>
  getOperators(): Promise<IOperatorOption[]>
  createEmployee(data: INewEmployeeRequest): Promise<IEmployeeResponse>
  getEmployee<T extends EmployeeType>(id: number, cargoType: T): Promise<TEmployeeResponseMap[T]>
}
