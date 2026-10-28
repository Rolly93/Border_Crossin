import { createApiClient } from "@/service/api";

const api = createApiClient();

export const systemConfigService = {
  async getScac(): Promise<string | null> {
    try {
      const response = await api.get<{ scac: string | null }>("/system/config");
      return response.data.scac;


    } catch (error: any) {
      console.log(error);
      throw error.message
    }
  },

  async setScac(scac: string): Promise<string> {
    try {
      const response = await api.put<{ scac: string }>("/system/config", { scac });
      return response.data.scac;



    } catch (error: any) {
      console.log(error);
      throw error.message
    }
  },
};
