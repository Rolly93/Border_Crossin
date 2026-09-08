import { AxiosInstance } from "axios";
import { createApiClient } from "@/service/api";

export abstract class BaseApiService {
  protected api: AxiosInstance;

  constructor(protected resourcePath: string) {
    this.api = createApiClient(import.meta.env.VITE_API_URL);
  }
}