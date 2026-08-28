import { createApiClient } from "@/service/api";
import { IBaseService, PaginatedResponse } from "./IBaseService";
import { ICliente } from "@/features/clients/types/Cliente";


export abstract class BaseApiService<T extends { id?: number }> implements IBaseService<T> {
  protected api = createApiClient(import.meta.env.VITE_API_URL)
  constructor(protected resourcePath: string) { }

  async getAll(): Promise<T[]> {
    const response = await this.api.get<T[]>(`/${this.resourcePath}/`);
    return response.data

  }
  async update(id: number, data: T): Promise<T> {
    const response = await this.api.put<T>(`/${this.resourcePath}/${id}/update/`, data)
    return response.data
  }
  async insert(data: T): Promise<T> {
    const response = await this.api.post<T>(`/${this.resourcePath}/create`, data)

    return response.data
  }
  async delete(id: number): Promise<T> {
    const response = await this.api.post<T>(`/${this.resourcePath}/delete`, id)
    return response.data
  }

  async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<T> | T[]> {
    const response = await this.api.get<PaginatedResponse<T>>(`${this.resourcePath}`, {
      params: { page, limit },
    });

    return response.data;

  }

}