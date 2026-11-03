import { AxiosInstance } from "axios";
import { IBaseService } from "./IBaseService";
import { apiClient } from "@/service/api";

export class BaseCrudApiService<T, UpdateT = Partial<T>, CreateT = T>
  implements IBaseService<T, UpdateT, CreateT> {
  protected resourcePath: string;
  protected api: AxiosInstance;

  constructor(resourcePath: string) {
    this.resourcePath = resourcePath;
    this.api = apiClient;
  }

  async getAll(): Promise<T[]> {
    const response = await this.api.get<T[]>(`/${this.resourcePath}`);
    return response.data;
  }

  async update(id: number, data: UpdateT): Promise<T> {
    const response = await this.api.put<T>(`/${this.resourcePath}/${id}`, data);
    return response.data;
  }

  // Update insert to use CreateT instead of T
  async insert(data: CreateT): Promise<T> {
    const response = await this.api.post<T>(`/${this.resourcePath}/create`, data);
    return response.data;
  }

  async delete(id: number): Promise<T> {
    const response = await this.api.delete<T>(`/${this.resourcePath}/${id}`);
    return response.data;
  }
}