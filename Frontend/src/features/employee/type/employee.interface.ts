/** @format */

import {
  IBaseService,
  PaginatedResponse,
} from "@/components/service/IBaseService";
import { TUnitType } from "@/features/unit/type/unit.interface";
import {
  TEmployeeCreateUnion,
  TEmployeeCreateUnionResponse,
  TEmployeeType,
  TOperatorOption,
  TPaginatedEmployeeResponse,
} from "../hook/useEmployee";

export interface IEmployeeRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  rfc: string;
  role: string;
  hireDate?: string;
  token?: string;
}

export interface IEmployeeResponse extends IEmployeeRequest {
  id?: number;
}

export interface IEmployeeFormsValues extends IEmployeeRequest {}

export interface EmployeeFormProps {
  onSuccess?: () => void;
  onSetRfc?: (rfc: string) => void;
  onClose?: () => void;
  employee?: IEmployeeRequest;
}

export type EmployeeType = "csr" | "operador";

export interface INewEmployeeRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  rfc: string;
  role: string;
  employeeType: EmployeeType;
  username?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
  licenseNumber?: string;
  licenseExpiration?: string;
  gafetId?: string;
}

export interface IEmployeeBaseResponse {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  hireDate?: string;
  rfc: string;
  role: string;
  employeeType: EmployeeType;
}

export interface IEmployeeUserResponse extends IEmployeeBaseResponse {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}
export interface IEmployeeDriverResponse extends IEmployeeBaseResponse {
  licenseNumber: string;
  licenseExpiration: string;
  gafetId: string;
}

export interface IOperatorOption {
  id: number;
  firstName: string;
  unit?: string;
  typeUnit?: TUnitType;
}

export interface IEmployeeFormRequest extends INewEmployeeRequest {
  id?: number;
}

export type TEmployeeResponseMap =
  | IEmployeeUserResponse
  | IEmployeeDriverResponse;

export interface IEmployeeService extends IBaseService<
  TEmployeeCreateUnionResponse,
  TEmployeeCreateUnion,
  TPaginatedEmployeeResponse
> {
  getPaginated(
    page: number,
    limit: number,
  ): Promise<TPaginatedEmployeeResponse>;
  getOperators(): Promise<TOperatorOption[]>;
  createEmployee(
    data: TEmployeeCreateUnion,
  ): Promise<TEmployeeCreateUnionResponse>;
  getEmployee<T extends TEmployeeType>(
    id: number,
    cargoType: T,
  ): Promise<TEmployeeResponseMap>;
}
