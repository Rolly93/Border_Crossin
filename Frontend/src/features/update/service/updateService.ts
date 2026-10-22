import { createApiClient } from "@/service/api";

const api = createApiClient();

export interface UpdateCheckResponse {
  update_available: boolean;
  version: string;
  type?: string;
  url?: string;
  mandatory?: boolean;
}

export interface ApplyUpdateResponse {
  message: string;
}

export interface CheckUpdateParams {
  company_id?: string;
}

export const updateService = {
  async checkUpdate(params: CheckUpdateParams = {}): Promise<UpdateCheckResponse> {
    const response = await api.get<UpdateCheckResponse>("/api/v1/check", {
      params: params,
    });
    return response.data;
  },

  async applyFrontendUpdate(downloadUrl: string): Promise<ApplyUpdateResponse> {
    const response = await api.post<ApplyUpdateResponse>("/api/v1/update/apply-frontend", {
      url: downloadUrl,
    });
    return response.data;
  },
};