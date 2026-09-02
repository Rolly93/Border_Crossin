import { ICliente } from "../types/Cliente";
import { CLIENT } from "../mocks/ClientMock";
import { BaseMockService } from "@/components/service/BaseMockService";
import { IClientService } from "../types/IClientService";
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


}