import { BaseApiService } from "./BaseApiService";
import { IBaseService } from "./IBaseService";

export abstract class BaseCrudApiService<T> extends BaseApiService
  implements IBaseService<T> {

  async getAll(): Promise<T[]> {
    const response = await this.api.get<T[]>(`${this.resourcePath}/`);
    return response.data

  }
  async update(id: number, data: T): Promise<T> {
    const response = await this.api.put<T>(`${this.resourcePath}/${id}/update/`, data)

    return response.data
  }

  async insert(data: T): Promise<T> {
    try {
      console.log(`${this.resourcePath}/create`, data);

      const response = await this.api.post<T>(`${this.resourcePath}/create`, data);
      return response.data;
    } catch (error: any) {
      const responseData = error.response?.data;

      let errorMessage: string;

      if (Array.isArray(responseData?.errors)) {
        errorMessage = responseData.errors.join(', ');
      }
      else if (Array.isArray(responseData?.detail)) {
        errorMessage = responseData.detail
          .map((err: any) => {
            if (typeof err === 'string') return err;
            const field = err.loc ? err.loc.slice(1).join('.') : '';
            return field ? `${field}: ${err.msg}` : err.msg;
          })
          .join(', ');
      }
      else if (typeof responseData?.detail === 'string') {
        errorMessage = responseData.detail;
      }
      else {
        errorMessage = responseData?.message || error.message || 'Failed to create record';
      }

      throw new Error(errorMessage);
    }
  }
  async delete(id: number): Promise<T> {

    const respose = await this.api.delete<T>(`${this.resourcePath}/delete`, {
      data: { id }
    })
    return respose.data
  }


}