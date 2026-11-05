/** @format */

import { IBaseService } from "@/components/service/IBaseService";
import {
  TClientMetricsResponse,
  TClientOption,
  TClientReferenceRule,
  TClientRequest,
  TClientResponse,
  TPaginatedClientResponse,
} from "../hooks/useClients";



export interface IClientService extends IBaseService<
  TClientResponse,
  TClientRequest,
  TClientRequest
> {
  active(id: number): Promise<TClientResponse>;
  getOptions(): Promise<TClientOption[]>;
  getByOperation(operation: string): Promise<TClientOption[]>;
  getReferenceRules(clientId: number): Promise<TClientReferenceRule[]>;
  getMetrics(): Promise<TClientMetricsResponse>;
  getPaginated(page: number, limit: number): Promise<TPaginatedClientResponse>;
}
