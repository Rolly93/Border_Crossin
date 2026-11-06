/** @format */

import {
  IBaseService,
} from "@/components/service/IBaseService";
import {
  TEmployeeCreateUnion,
  TEmployeeCreateUnionResponse,
  TEmployeeType,
  TOperatorOption,
  TPaginatedEmployeeResponse,
} from "../hook/useEmployee";
import { TUnitType } from "@/features/unit/hook/useUnits";



export interface EmployeeFormProps {
  onSuccess?: () => void;
  onSetRfc?: (rfc: string) => void;
  onClose?: () => void;
  employee?: TEmployeeCreateUnion;
}

export interface IOperatorOption {
  id: number;
  firstName: string;
  unit?: string;
  typeUnit?: TUnitType;
}

export interface IEmployeeService extends IBaseService<
  TEmployeeCreateUnionResponse,
  TEmployeeCreateUnion,
  TEmployeeCreateUnion
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
  ): Promise<TEmployeeCreateUnion>;
}
