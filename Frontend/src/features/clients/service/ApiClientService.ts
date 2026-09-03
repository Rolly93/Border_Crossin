import { BaseApiService } from "@/components/service/BaseApiService";
import { ICliente } from "../types/Cliente";
import { IClientService } from "../types/IClientService";
import { PaginatedResponse } from "@/components/service/IBaseService";

interface MetricsResponse {
  totalClients: number;
  activeClient: number;
  emailService: number;
  sftpService: number;

}
export class ApiClientService extends BaseApiService<ICliente> implements IClientService {
  constructor() {
    super('client');
  }
  async getMetrics(): Promise<MetricsResponse> {
    const response = await this.api.get<MetricsResponse>(`/${this.resourcePath}/metrics`)
    return response.data
  }


  async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<ICliente>> {
    const response = await this.api.get<PaginatedResponse<ICliente>>(`${this.resourcePath}`, {
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