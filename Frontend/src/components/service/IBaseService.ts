
export interface IBaseService<T> {
  getAll(): Promise<T[]>;
  update(id: number, data: T): Promise<T>;
  insert(data: T): Promise<T>;
  delete(id: number): Promise<T>;
}

export interface ISftpService<T> {
  getConnection(id: number): Promise<T | null>;
  insert(data: T): Promise<T>;
  update(id: number, data: T): Promise<T>;
}