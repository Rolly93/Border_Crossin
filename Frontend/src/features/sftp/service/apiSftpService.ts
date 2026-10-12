import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { ISftpConfiguration } from "@/features/clients/types/Cliente";
import { ISftpSend, SftpSendFilters } from "../types/ISftpSend";


export class ApiSftpService extends BaseCrudApiService<ISftpConfiguration> {
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

  async getSends(filters: SftpSendFilters): Promise<ISftpSend[]> {
    const response = await this.api.get<ISftpSend[]>(`/${this.resourcePath}/sends`, {
      params: {
        client_id: filters.client_id,
        reference: filters.reference,
        status: filters.status,
      },
    });
    return response.data;
  }

  async resend(sendIds: number[]): Promise<ISftpSend[]> {
    const response = await this.api.post<ISftpSend[]>(`/${this.resourcePath}/resend`, {
      send_ids: sendIds,
    });
    return response.data;
  }

  async update(id: number, data: ISftpConfiguration): Promise<ISftpConfiguration> {
    const response = await this.api.put<ISftpConfiguration>(
      `/${this.resourcePath}/update/${id}`,
      data
    );
    return response.data;
  }
}
