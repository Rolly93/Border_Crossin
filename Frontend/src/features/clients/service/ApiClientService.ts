import { BaseApiService } from "@/components/service/BaseApiService";
import { ICliente } from "../types/Cliente";
export class ApiClientService extends BaseApiService<ICliente> {
  constructor() {
    super('client');
  }
}