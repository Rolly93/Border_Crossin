import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { ISftpConfiguration } from "@/features/clients/types/Cliente";


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

  async update(id: number, data: ISftpConfiguration): Promise<ISftpConfiguration> {
    const response = await this.api.put<ISftpConfiguration>(
      `/${this.resourcePath}/update/${id}`,
      data
    );
    return response.data;
  }
}
