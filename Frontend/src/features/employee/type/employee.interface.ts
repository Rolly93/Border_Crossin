import { IBaseService } from "@/components/service/IBaseService";

export interface IEmployeeFormsValues {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  rfc: string;


  role: string;
}

export interface EmployeeFormProps {
  onSuccess?: () => void;
}


interface IEmployeeService extends IBaseService<IEmployeeFormsValues> {

}