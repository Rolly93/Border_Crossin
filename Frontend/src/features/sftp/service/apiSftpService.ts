import { BaseCrudApiService } from '@/components/service/BaseCrudApiService';
import { ISftpConfiguration, ISftpSend, SftpSendFilters } from '@/features/clients/types/Cliente';


export class ApiSftpService extends BaseCrudApiService<ISftpConfiguration, Partial<ISftpConfiguration>> {
  constructor() {
    super('sftp');
  }

  async getConnection(clientId: number): Promise<ISftpConfiguration | null> {
    try {
      const response = await this.api.get<ISftpConfiguration | null>(
        `/${this.resourcePath}/connection`,
        { params: { client_id: clientId } }
      );
      return response.data;


    } catch (error: any) {
      throw error.message
    }
  }

  async update(id: number, data: Partial<ISftpConfiguration>): Promise<ISftpConfiguration> {
    try {
      const response = await this.api.put<ISftpConfiguration>(
        `/${this.resourcePath}/update/${id}`,
        data
      );
      return response.data;


    } catch (error: any) {
      throw error.message
    }
  }

  async listSends(filters?: SftpSendFilters): Promise<ISftpSend[]> {
    try {
      const params: Record<string, string | number> = {};
      if (filters?.client_id) {
        params.client_id = filters.client_id;
      }
      if (filters?.reference) {
        params.reference = filters.reference;
      }
      if (filters?.status) {
        params.status = filters.status;
      }

      const response = await this.api.get<ISftpSend[]>(
        `/${this.resourcePath}/sends`,
        { params }
      );
      return response.data;


    } catch (error: any) {
      throw error.message
    }
  }

  async resend(sendIds: number[]): Promise<ISftpSend[]> {
    try {
      const response = await this.api.post<ISftpSend[]>(
        `/${this.resourcePath}/resend`,
        { send_ids: sendIds }
      );
      return response.data;


    } catch (error: any) {
      throw error.message
    }
  }
}