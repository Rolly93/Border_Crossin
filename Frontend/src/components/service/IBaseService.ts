
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
  getPaginated(page: number, limit: number): Promise<PaginatedResponse<T>>;
}

export interface ISftpService<T> {
  getConnection(id: number): Promise<T | null>;
  insert(data: T): Promise<T>;
  update(id: number, data: T): Promise<T>;
}