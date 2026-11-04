import { IBaseService, PaginatedResponse } from "@/components/service/IBaseService";
import { TClientMetricsResponse, TClientOption, TClientReferenceRule, TClientRequest, TClientResponse, TPaginatedClientResponse } from "../hooks/useClients";

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

export interface IClientService extends IBaseService<TClientResponse, Partial<TClientRequest>, Partial<TPaginatedClientResponse>> {
  active(id: number): Promise<TClientResponse>
  getOptions(): Promise<TClientOption[]>
  getByOperation(operation: string): Promise<TClientOption[]>
  getReferenceRules(clientId: number): Promise<TClientReferenceRule[]>
  getMetrics(): Promise<TClientMetricsResponse>;
  getPaginated(page: number, limit: number): Promise<PaginatedResponse<TClientResponse>>
}