import { createApiClient } from "@/service/api";
import { IBaseService } from "./IBaseService";
import { data } from "react-router-dom";

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

}