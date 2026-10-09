import { IBaseService, PaginatedResponse } from "@/components/service/IBaseService";


export interface IEmployeeRequest {

  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  rfc: string;
  role: string;
  hireDate?: string;
  token?: string

}
interface TDriverDetailsRequest {
  driver_license_number: string;
  expiration_date: Date;
  gafet_id?: string;
}

interface TDriverDetailsResponse extends TDriverDetailsRequest {
  id: number
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


export interface IEmployeeService extends IBaseService<IEmployeeResponse> {
  getPaginated(page: number, limit: number): Promise<PaginatedResponse<IEmployeeResponse>>

}