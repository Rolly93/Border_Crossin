
export interface IBaseService<T> {
  getAll(): Promise<T[]>;
  update(id: number, data: T): Promise<T>;
  insert(data: T): Promise<T>;
}