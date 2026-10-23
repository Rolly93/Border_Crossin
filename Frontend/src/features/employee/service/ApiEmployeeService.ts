import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import {
  IEmployeeRequest,
  IEmployeeService,
  IEmployeeResponse,
  IOperatorOption,
  INewEmployeeRequest,
  TEmployeeResponseMap,
  EmployeeType,
} from "../type/employee.interface";
import { PaginatedResponse } from "@/components/service/IBaseService";

export class ApiEmployeeService
  extends BaseCrudApiService<IEmployeeResponse, IEmployeeRequest>
  implements IEmployeeService {
  constructor() {
    super("employees");
  }

  async getEmployee<T extends EmployeeType>(id: number, cargoType: T): Promise<TEmployeeResponseMap> {
    const response = await this.api.get<{ data: TEmployeeResponseMap }>(`${this.resourcePath}/${id}`, {
      params: { cargoType },
    });

    if (response.status === 200) {
      return response.data.data;
    }
    throw new Error("No se pudo obtener el empleado");
  }

  override async insert(data: IEmployeeRequest): Promise<IEmployeeResponse> {
    const responseData = await super.insert(data);

    if ("token" in responseData && responseData.token) {
      localStorage.setItem("jwt_token", responseData.token);
    }

    return responseData;
  }

  async createEmployee(data: INewEmployeeRequest): Promise<IEmployeeResponse> {
    const response = await this.api.post<IEmployeeResponse>(`${this.resourcePath}/create`, data);
    return response.data;
  }

  async getPaginated(page: number, limit: number): Promise<PaginatedResponse<TEmployeeResponseMap>> {
    const response = await this.api.get<PaginatedResponse<TEmployeeResponseMap>>(`${this.resourcePath}/`, {
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
      data: response.data.data,
    };
  }

  async getOperators(): Promise<IOperatorOption[]> {
    const response = await this.api.get<IOperatorOption[]>(`${this.resourcePath}/operators`);
    return response.data;
  }
}