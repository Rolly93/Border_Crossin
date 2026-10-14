import { BaseCrudApiService } from '@/components/service/BaseCrudApiService';
import { ISftpConfiguration, ISftpSend, SftpSendFilters, ResendRequest } from '@/features/clients/types/Cliente';


export class ApiSftpService extends BaseCrudApiService<ISftpConfiguration, Partial<ISftpConfiguration>> {
  constructor() {
    super('sftp');
  }

  async getConnection(clientId: number): Promise<ISftpConfiguration | null> {
    const response = await this.api.get<ISftpConfiguration | null>(
      `/${this.resourcePath}/connection`,
      { params: { client_id: clientId } }
    );
    return response.data;
  }

  async update(id: number, data: Partial<ISftpConfiguration>): Promise<ISftpConfiguration> {
    const response = await this.api.put<ISftpConfiguration>(
      `/${this.resourcePath}/update/${id}`,
      data
    );
    return response.data;
  }

  async listSends(filters?: SftpSendFilters): Promise<ISftpSend[]> {
    const params: Record<string, string | number> = {};
    if (filters?.client_id) params.client_id = filters.client_id;
    if (filters?.reference) params.reference = filters.reference;
    if (filters?.status) params.status = filters.status;

    const response = await this.api.get<ISftpSend[]>(
      `/${this.resourcePath}/sends`,
      { params }
    );
    return response.data;
  }

  async resend(sendIds: number[]): Promise<ISftpSend[]> {
    const response = await this.api.post<ISftpSend[]>(
      `/${this.resourcePath}/resend`,
      { send_ids: sendIds }
    );
    return response.data;
  }
}