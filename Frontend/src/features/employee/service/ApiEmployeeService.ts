/** @format */

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

  async getEmployee<T extends EmployeeType>(
    id: number,
    cargoType: T,
  ): Promise<TEmployeeResponseMap> {
    try {
      const response = await this.api.get<{ data: TEmployeeResponseMap }>(
        `${this.resourcePath}/${id}`,
        { params: { cargoType } },
      );

      return response.data.data;



    } catch (error: any) {
      throw error.message
    }
  }

  override async insert(data: IEmployeeRequest): Promise<IEmployeeResponse> {
    try {
      const responseData = await super.insert(data);

      if ("token" in responseData && responseData.token) {
        localStorage.setItem("jwt_token", responseData.token);
      }

      return responseData;


    } catch (error: any) {
      throw error.message
    }
  }

  async createEmployee(data: INewEmployeeRequest): Promise<IEmployeeResponse> {
    try {
      const response = await this.api.post<IEmployeeResponse>(
        `${this.resourcePath}/create`,
        data,
      );
      return response.data;

    } catch (error: any) {
      throw error.message
    }
  }

  async getPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<TEmployeeResponseMap>> {

    try {
      const response = await this.api.get<PaginatedResponse<TEmployeeResponseMap>>(`${this.resourcePath}/`, { params: { page, limit } });
      //if (response.status === 200) {
      //  return response.data;
      //}
      return {
        page: response.data.page,
        hasNextPage: response.data.hasNextPage,
        totalRecords: response.data.totalRecords,
        limit: response.data.limit,
        data: response.data.data,
      };

    } catch (error: any) {
      throw error.message
    }
  }

  async getOperators(): Promise<IOperatorOption[]> {

    try {
      const response = await this.api.get<IOperatorOption[]>(
        `${this.resourcePath}/operators`,
      );

      return response.data;

    } catch (error: any) {
      throw error.message
    }
  }
}
