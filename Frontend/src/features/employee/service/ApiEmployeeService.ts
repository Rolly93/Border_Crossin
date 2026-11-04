/** @format */

import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { IEmployeeService } from "../type/employee.interface";
import { TEmployeeCreateUnion, TEmployeeCreateUnionResponse, TEmployeeType, TOperatorOption, TPaginatedEmployeeResponse } from "../hook/useEmployee";

export class ApiEmployeeService
  extends BaseCrudApiService<TEmployeeCreateUnionResponse, Partial<TEmployeeCreateUnion>, Partial<TPaginatedEmployeeResponse>>
  implements IEmployeeService {
  constructor() {
    super("employees");
  }

  async getEmployee<T extends TEmployeeType>(
    id: number,
    cargoType: T,
  ): Promise<TEmployeeCreateUnionResponse> {
    try {
      const response = await this.api.get<TEmployeeCreateUnionResponse>(
        `${this.resourcePath}/${id}`,
        { params: { cargoType } },
      );
      console.log(response.data);

      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  async createEmployee(data: TEmployeeCreateUnion): Promise<TEmployeeCreateUnionResponse> {
    try {
      const response = await this.api.post<TEmployeeCreateUnionResponse>(
        `${this.resourcePath}/create`,
        data,
      );
      return response.data;
    } catch (error: any) {
      throw error.message;
    }
  }

  async getPaginated(
    page: number,
    limit: number,
  ): Promise<TPaginatedEmployeeResponse> {
    try {
      const response = await this.api.get<TPaginatedEmployeeResponse>(`${this.resourcePath}/`, { params: { page, limit } });


      return response.data;
    } catch (error: any) {
      throw error.message;
    }
  }

  async getOperators(): Promise<TOperatorOption[]> {
    try {
      const response = await this.api.get<TOperatorOption[]>(
        `${this.resourcePath}/operators`,
      );

      return response.data;
    } catch (error: any) {
      throw error.message;
    }
  }
}
