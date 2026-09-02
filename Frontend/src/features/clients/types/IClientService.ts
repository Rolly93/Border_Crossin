import { IBaseService } from "@/components/service/IBaseService";
import { ICliente } from "./Cliente";

export interface ClientMetricsResponse {
  totalClients: number;
  activeClient: number;
  emailService: number;
  sftpService: number;
}

export interface IClientService extends IBaseService<ICliente> {
  getMetrics(): Promise<ClientMetricsResponse>;
}