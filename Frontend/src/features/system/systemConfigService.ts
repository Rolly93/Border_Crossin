import { createApiClient } from "@/service/api";

const api = createApiClient(import.meta.env.VITE_API_URL);

export const systemConfigService = {
  async getScac(): Promise<string | null> {
    const response = await api.get<{ scac: string | null }>("/system/config");
    return response.data.scac;
  },

  async setScac(scac: string): Promise<string> {
    const response = await api.put<{ scac: string }>("/system/config", { scac });
    return response.data.scac;
  },
};
