import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { IEmployee, IEmployeeCreate, IEmployeeService } from "../type/employee.interface";
import { PaginatedResponse } from "@/components/service/IBaseService";

export class ApiEmployeeService
  extends BaseCrudApiService<IEmployee>
  implements IEmployeeService {
  constructor() {
    super('/employees');
  }

  override async insert(data: IEmployeeCreate): Promise<IEmployee> {
    const responseData = (await super.insert(data as unknown as IEmployee)) as IEmployee;

    if (responseData.token) {
      localStorage.setItem("jwt_token", responseData.token);
    }

    return responseData;
  }
  async getPaginated(page: number, limit: number): Promise<PaginatedResponse<IEmployee>> {
    const response = await this.api.get<PaginatedResponse<IEmployee>>(`${this.resourcePath}/`, {
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
}