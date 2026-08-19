import { createApiClient } from "../../../service/api";
import { BaseClientService } from "./BaseClientService";
import { ICliente } from "../types/Cliente";
import { IClientService } from "./IClientService";

export class ApiClientService extends BaseClientService implements IClientService {
  private api = createApiClient(import.meta.env.VITE_API_URL)

  async getAll(): Promise<ICliente[]> {
    const response = await this.api.get<ICliente[]>('/client');
    return response.data
  }
  async update(id: number, data: ICliente): Promise<ICliente> {
    console.log(data)
    const response = await this.api.put<ICliente>(`/client/${id}/update`, data);
    return response.data
  }

  async insert(data: ICliente): Promise<ICliente> {
    const response = await this.api.post<ICliente>('/client/create', data);
    return response.data
  }
}