import { IBaseService } from "@/components/service/IBaseService";
import { ISftpConfiguration } from "@/features/clients/types/Cliente";
import { ApiSftpService } from "./apiSftpService";
import { MockSftpService } from "./MockSftpService";

const ip = import.meta.env.VITE_API_URL || false

export const sftpService: IBaseService<ISftpConfiguration> = ip ?
  new ApiSftpService() : new MockSftpService();