import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { ISftpConfiguration } from "@/features/clients/types/Cliente";


export class ApiSftpService extends BaseCrudApiService<ISftpConfiguration> {
  constructor() {
    super('sftp');
  }

  async getConnection(id: number): Promise<ISftpConfiguration> {
    const response = await this.api.get<ISftpConfiguration>(`/${this.resourcePath}/connection`)
    if (!response.status) { throw new Error('Error en el servidor') }

    return response.data
  }

}