import { ICliente } from "../types/Cliente";

export interface IClientService {
  getAll(): Promise<ICliente[]>;
  update(id: number, data: ICliente): Promise<ICliente>;
  insert(data: ICliente): Promise<ICliente>;
}