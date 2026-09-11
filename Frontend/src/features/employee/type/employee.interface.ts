import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";


export interface IEmployee {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  rfc: string;
  role: string;
}
export type IEmployeeCreate = Omit<IEmployee, 'id'>
export interface IEmployeeFormsValues extends IEmployeeCreate {



}

export interface EmployeeFormProps {
  onSuccess?: () => void;
}


export interface IEmployeeService {
  getAll(): Promise<IEmployee[]>;
  getById?(id: number): Promise<IEmployee | undefined>;
  insert(data: IEmployeeCreate): Promise<IEmployee>;
  update(id: number, data: Partial<IEmployee>): Promise<IEmployee>;
  delete(id: number): Promise<IEmployee>;
}