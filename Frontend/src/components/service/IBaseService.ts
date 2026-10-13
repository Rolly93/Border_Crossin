import { ISftpConfiguration, ISftpSend, ISftpSendFilters, ResendRequest } from "@/features/clients/types/Cliente";

export interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  hasNextPage: boolean;
  page: number;
  limit: number;
}


export interface IBaseService<T, UpdateT = Partial<T>> {
  getAll(): Promise<T[]>;
  update(id: number, data: UpdateT): Promise<T>;
  insert(data: T): Promise<T>;
  delete(id: number): Promise<T>;
}

export interface ISftpService extends IBaseService<ISftpConfiguration, Partial<ISftpConfiguration>> {
  getConnection(id: number): Promise<ISftpConfiguration | null>;
<<<<<<< Updated upstream
  getSends(filters: import("@/features/sftp/types/ISftpSend").SftpSendFilters): Promise<import("@/features/sftp/types/ISftpSend").ISftpSend[]>;
  resend(sendIds: number[]): Promise<import("@/features/sftp/types/ISftpSend").ISftpSend[]>;
=======
  listSends(filters?: ISftpSendFilters): Promise<ISftpSend[]>;
  resend(sendIds: number[]): Promise<ISftpSend[]>;
>>>>>>> Stashed changes
}