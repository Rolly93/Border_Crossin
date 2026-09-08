import { BaseApiService } from "./BaseApiService";
import { IBaseService } from "./IBaseService";

export abstract class BaseCrudApiService<T> extends BaseApiService
  implements IBaseService<T> {

  async getAll(): Promise<T[]> {
    const response = await this.api.get<T[]>(`/${this.resourcePath}/`);
    return response.data

  }
  async update(id: number, data: T): Promise<T> {
    const response = await this.api.put<T>(`/${this.resourcePath}/${id}/update/`, data)
    return response.data
  }
  async insert(data: T): Promise<T> {
    try {
      const response = await this.api.post<T>(`/${this.resourcePath}/create`, data);
      return response.data
    } catch (error: any) {
      if (error.response?.data?.errors) {
        throw error.response.data.errors;
      }
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create record';
      throw new Error(errorMessage);
    }
  }
  async delete(id: number): Promise<T> {

    const respose = await this.api.delete<T>(`/${this.resourcePath}/delete`, {
      data: { id }
    })
    return respose.data
  }


}