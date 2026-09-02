import { BaseApiService } from "@/components/service/BaseApiService";
import { ICliente } from "../types/Cliente";
import { IClientService } from "../types/IClientService";

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
}