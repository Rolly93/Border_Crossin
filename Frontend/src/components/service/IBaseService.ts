
export interface IBaseService<T> {
  getAll(): Promise<T[]>;
  update(id: number, data: T): Promise<T>;
  insert(data: T): Promise<T>;
}

export interface ISftpService<T> {
  update(id: number, data: T): Promise<T>;
  insert(data: T): Promise<T>;
  getConnection(id: number): Promise<T>;
}