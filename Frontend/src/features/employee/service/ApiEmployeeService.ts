import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import {
  IEmployeeRequest,
  IEmployeeService,
  IEmployeeResponse,
  IOperatorOption,
  INewEmployeeRequest,
} from "../type/employee.interface";
import { PaginatedResponse } from "@/components/service/IBaseService";

export class ApiEmployeeService
  extends BaseCrudApiService<IEmployeeResponse, IEmployeeRequest>
  implements IEmployeeService {
  constructor() {
    super('/employees');
  }

  override async insert(data: IEmployeeRequest): Promise<IEmployeeRequest> {
    const responseData = (await super.insert(data as unknown as IEmployeeRequest)) as IEmployeeRequest;

    if (responseData.token) {
      localStorage.setItem("jwt_token", responseData.token);
    }

    return responseData;
  }

  /** Alta de empleado tipo cargo u operador (cuenta o licencia según el tipo). */
  async createEmployee(data: INewEmployeeRequest): Promise<IEmployeeResponse> {
    const response = await this.api.post<IEmployeeResponse>(`${this.resourcePath}/create`, data);
    return response.data;
  }



  async getPaginated(page: number, limit: number): Promise<PaginatedResponse<IEmployeeResponse>> {
    const response = await this.api.get<PaginatedResponse<IEmployeeResponse>>(`${this.resourcePath}/`, {
      params: { page, limit },
    });
    if (response.status === 200) {
      return response.data;
    }
    return {
      page: response.data.page,
      hasNextPage: response.data.hasNextPage,
      totalRecords: response.data.totalRecords,
      limit: response.data.limit,
      data: response.data.data
    }

  }

  async getOperators(): Promise<IOperatorOption[]> {
    const response = await this.api.get<IOperatorOption[]>(`${this.resourcePath}/operators`);
    return response.data;
  }
}
