
import { LOADSHIPMENT } from "@/features/shipments/mocks/shipmentsMock";
import { BaseClientService } from "./BaseClientService";
import { IClientService } from "./IClientService";
import { ICliente } from "../types/Cliente";
import { CLIENT } from "../mocks/ClientMock";
export class MockClientSerivce extends BaseClientService implements IClientService {
  async getAll(): Promise<ICliente[]> {
    await this.delay(600);
    return [...CLIENT]
  }
  async update(id: number, data: ICliente): Promise<ICliente> {
    await this.delay(100);
    const index = CLIENT.findIndex(item => item.id == id);
    if (index !== -1) CLIENT[index] = { ...data }
    return data
  }
  async insert(data: ICliente): Promise<ICliente> {
    await this.delay(100);
    const nextId = CLIENT.length > 0 ? Math.max(...CLIENT.map(i => i.id)) + 1 : 1;
    const nextClient = { ...data, id: nextId, };
    return nextClient;
  }

}