import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { IEmployee, IEmployeeCreate, IEmployeeCreateResponse, IEmployeeService } from "../type/employee.interface";

export class ApiEmployeeService
  extends BaseCrudApiService<IEmployee>
  implements IEmployeeService {
  constructor() {
    super('/employees');
  }

  override async insert(data: IEmployeeCreate): Promise<IEmployeeCreateResponse> {
    const responseData = (await super.insert(data as unknown as IEmployee)) as IEmployeeCreateResponse;

    if (responseData.token) {
      localStorage.setItem("jwt_token", responseData.token);
    }

    return responseData;
  }
}