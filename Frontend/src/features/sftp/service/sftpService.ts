import { ISftpService } from "@/components/service/IBaseService";
import { ApiSftpService } from "./apiSftpService";

export const sftpService: ISftpService = new ApiSftpService();
