import { ICliente } from "../types/Cliente";
import { CLIENT } from "../mocks/ClientMock";
import { BaseMockService } from "@/components/service/BaseMockService";
import { IClientService } from "../types/IClientService";
import { PaginatedResponse } from "@/components/service/IBaseService";
interface MetricsResponse {
  totalClients: number;
  activeClient: number;
  emailService: number;
  sftpService: number;

}
export class MockClientSerivce extends BaseMockService<ICliente> implements IClientService {
  constructor() {
    super(CLIENT);
  }
  async getMetrics(): Promise<MetricsResponse> {
    await this.delay(300);

    const clients = this.items
    return {
      totalClients: clients.length,
      activeClient: clients.filter((c) => c.estatus).length,
      emailService: clients.filter((c) => c.estatus && c.emailService).length,
      sftpService: clients.filter((c) => c.estatus && c.sftService).length,
    }

  }

  async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<ICliente>> {
    await this.delay(1000);
    const safeData = Array.isArray(this.items) ? this.items : [];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = safeData.slice(startIndex, endIndex);
    return {
      data,
      totalRecords: safeData.length,
      hasNextPage: endIndex < safeData.length,
      page, limit
    }
  }


}