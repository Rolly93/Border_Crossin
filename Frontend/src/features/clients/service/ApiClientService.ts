import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { ICliente } from "../types/Cliente";
import { IClientService } from "../types/IClientService";
import { PaginatedResponse } from "@/components/service/IBaseService";

interface MetricsResponse {
  totalClients: number;
  activeClient: number;
  emailService: number;
  sftpService: number;

}
export class ApiClientService extends BaseCrudApiService<ICliente> implements IClientService {
  constructor() {
    super('client');
  }

  override async getAll(): Promise<ICliente[]> {
    const response = await this.api.get<ICliente[]>(`/${this.resourcePath}/all`);

    return response.data

  }

  async active(id: number): Promise<ICliente> {

    const response = await this.api.put<ICliente>(`/${this.resourcePath}/reactive/${id}`);

    return response.data


  }
  async getMetrics(): Promise<MetricsResponse> {
    try {
      const response = await this.api.get<MetricsResponse>(`${this.resourcePath}/metrics`);


      return response.data;
    } catch (error: any) {
      console.error("Error fetching metrics:", error);

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch metrics";

      throw new Error(errorMessage);
    }
  }



  async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<ICliente>> {
    const response = await this.api.get<PaginatedResponse<ICliente>>(`${this.resourcePath}`, {
      params: { page: page, limit: limit },
    });
    console.log(response.data);

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