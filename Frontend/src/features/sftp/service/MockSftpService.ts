import { ISftpConfiguration } from "@/features/clients/types/Cliente";
import { SftConfiguration } from "@/features/clients/mocks/ClientMock";
import { BaseMockService } from "@/components/service/BaseMockService";

export class MockSftpService extends BaseMockService<ISftpConfiguration> {
  constructor() {
    super(SftConfiguration)
  }

  async getConnection(clientId: number): Promise<ISftpConfiguration | null> {
    await this.delay(100);


    const index = SftConfiguration.findIndex((item) => item.idClient === clientId)

    if (index < 0) { throw new Error("Client without SFTP Service") }
    const configSftp = SftConfiguration[index]
    if (!configSftp) {
      return null
    }
    return configSftp

  }
}