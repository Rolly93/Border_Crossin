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
  sftService: boolean;
}

export interface IClientNameOption {
  id: number;
  name: string;
}

export interface IClientReferenceRule {
  id: number;
  operation_type: string;
  prefix: string;
  reference_length: number | null;
}

export interface ClientRequest {
  phonenumber?: string;
  sftService?: boolean;
  emailService?: boolean;
  email?: string[] | null;
  name: string;
}

export interface IClientService extends IBaseService<ICliente, ClientRequest> {
  active(id: number): Promise<ICliente>
  getOptions(): Promise<IClientOption[]>
  getByOperation(operation: string): Promise<IClientNameOption[]>
  getReferenceRules(clientId: number): Promise<IClientReferenceRule[]>
  getMetrics(): Promise<ClientMetricsResponse>;
  getPaginated(page: number, limit: number): Promise<PaginatedResponse<ICliente>>
}