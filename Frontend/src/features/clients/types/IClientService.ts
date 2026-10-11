import { IBaseService, PaginatedResponse } from "@/components/service/IBaseService";
import { ICliente } from "./Cliente";

export interface ClientMetricsResponse {
  totalClients: number;
  emailService: number;
  sftpService: number;
}

export interface IClientOption {
  id: number;
  name: string;
  has_sftp: boolean;
}

export interface IClientService extends IBaseService<ICliente> {
  active(id: number): Promise<ICliente>
  getOptions(): Promise<IClientOption[]>
  getMetrics(): Promise<ClientMetricsResponse>;
  getPaginated(page: number, limit: number): Promise<PaginatedResponse<ICliente>>
}