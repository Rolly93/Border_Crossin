import { ISftpConfiguration } from "@/features/clients/types/Cliente";

export interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  hasNextPage: boolean;
  page: number;
  limit: number;
}


export interface IBaseService<T> {
  getAll(): Promise<T[]>;
  update(id: number, data: T): Promise<T>;
  insert(data: T): Promise<T>;
  delete(id: number): Promise<T>;
}

export interface ISftpService extends IBaseService<ISftpConfiguration> {
  getConnection(id: number): Promise<ISftpConfiguration | null>;
}