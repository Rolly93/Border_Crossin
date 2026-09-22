import { IBaseService, PaginatedResponse } from "@/components/service/IBaseService";


export interface IEmployee {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  rfc: string;
  role: string;
  token?: string;
  detail?: string;

}





export interface IEMployeeResponse extends IEmployee { }
export type IEmployeeCreate = Omit<IEmployee, 'id'>
export interface IEmployeeFormsValues extends IEmployeeCreate {
}

export interface EmployeeFormProps {
  onSuccess?: () => void;
  onSetRfc?: (rfc: string) => void;
}


export interface IEmployeeService extends IBaseService<IEmployee> {
  getPaginated(page: number, limit: number): Promise<PaginatedResponse<IEmployee>>

}