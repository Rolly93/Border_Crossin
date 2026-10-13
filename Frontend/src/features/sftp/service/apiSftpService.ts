import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
<<<<<<< Updated upstream
import { ISftpConfiguration } from "@/features/clients/types/Cliente";
import { ISftpSend, SftpSendFilters } from "../types/ISftpSend";
=======
import { ISftpConfiguration, ISftpSend, ISftpSendFilters, ResendRequest } from "@/features/clients/types/Cliente";
>>>>>>> Stashed changes


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

<<<<<<< Updated upstream
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
=======
  async update(id: number, data: Partial<ISftpConfiguration>): Promise<ISftpConfiguration> {
>>>>>>> Stashed changes
    const response = await this.api.put<ISftpConfiguration>(
      `/${this.resourcePath}/update/${id}`,
      data
    );
    return response.data;
  }

  async listSends(filters?: ISftpSendFilters): Promise<ISftpSend[]> {
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
