import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { IClientService } from "../types/IClientService";
import { PaginatedResponse } from "@/components/service/IBaseService";
import { TClientMetricsResponse, TClientOption, TClientReferenceRule, TClientRequest, TClientResponse, TPaginatedClientResponse } from "../hooks/useClients";


export class ApiClientService extends BaseCrudApiService<TClientResponse, Partial<TClientRequest>, Partial<TPaginatedClientResponse>> implements IClientService {
  constructor() {
    super('client');
  }

  override async getAll(): Promise<TClientResponse[]> {
    try {
      const response = await this.api.get<TClientResponse[]>(`/${this.resourcePath}/all`);

      return response.data


    } catch (error: any) {
      console.log(error);
      throw error.message
    }

  }

  async getByOperation(operation: string): Promise<TClientOption[]> {
    try {
      const response = await this.api.get<TClientOption[]>(`/${this.resourcePath}/by-operation`, {
        params: { operation_type: operation },
      });
      return response.data;


    } catch (error: any) {
      throw error.message
    }
  }

  async getReferenceRules(clientId: number): Promise<TClientReferenceRule[]> {
    try {
      const response = await this.api.get<TClientReferenceRule[]>(
        `/${this.resourcePath}/${clientId}/reference-rules`
      );
      return response.data;

    } catch (error: any) {
      throw error.message
    }
  }

  async getOptions(): Promise<TClientOption[]> {
    const response = await this.api.get<TClientOption[]>(`/${this.resourcePath}/all`);
    return response.data;
  }

  async active(id: number): Promise<TClientResponse> {

    try {
      const response = await this.api.put<TClientResponse>(`/${this.resourcePath}/reactive/${id}`);

      return response.data

    } catch (error: any) {
      throw error.message
    }


  }
  async getMetrics(): Promise<TClientMetricsResponse> {
    try {
      const response = await this.api.get<TClientMetricsResponse>(`${this.resourcePath}/metrics`);


      return response.data;
    } catch (error: any) {
      console.log(error);

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch metrics";

      throw new Error(errorMessage);
    }
  }



  async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<TClientResponse>> {
    try {
      const response = await this.api.get<PaginatedResponse<TClientResponse>>(`${this.resourcePath}`, {
        params: { page: page, limit: limit },
      });

      if (response.status === 200) {
        console.log(response.data);

        return response.data;
      }

      return {
        page: response.data.page,
        hasNextPage: response.data.hasNextPage,
        totalRecords: response.data.totalRecords,
        limit: response.data.limit,
        data: response.data.data
      }

    } catch (error: any) {
      throw error.message
    }

  }

}