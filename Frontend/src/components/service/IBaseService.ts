import { ISftpConfiguration, ISftpSend, SftpSendFilters } from '@/features/clients/types/Cliente';
import { ISftpTestResult } from '@/features/sftp/types/ISftpSend';

export interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  hasNextPage: boolean;
  page: number;
  limit: number;
}


export interface IBaseService<T, UpdateT = Partial<T>, CreateT = T> {
  getAll(): Promise<T[]>;
  update(id: number, data: UpdateT): Promise<T>;
  insert(data: CreateT): Promise<T>;
  delete(id: number): Promise<T>;
}


export interface ISftpService extends IBaseService<ISftpConfiguration, Partial<ISftpConfiguration>> {
  getConnection(id: number): Promise<ISftpConfiguration | null>;
  listSends(filters?: SftpSendFilters): Promise<ISftpSend[]>;
  resend(sendIds: number[]): Promise<ISftpSend[]>;
  testConnection(id: number): Promise<ISftpTestResult>;
}