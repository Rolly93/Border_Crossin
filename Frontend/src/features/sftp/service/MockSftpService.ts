import { ISftpConfiguration } from "@/features/clients/types/Cliente";
import { SftConfiguration } from "@/features/clients/mocks/ClientMock";
import { BaseMockService } from "@/components/service/BaseMockService";

export class MockSftpService extends BaseMockService<ISftpConfiguration> {
  constructor() {
    super(SftConfiguration)
  }

  async getConnection(id: number): Promise<ISftpConfiguration> {
    await this.delay(100);

    const index = SftConfiguration.findIndex((item) => item.idClient === id)
    if (index !== -1) { throw new Error("Item nor found") }
    const configSftp = SftConfiguration[index]

    return configSftp

  }
}