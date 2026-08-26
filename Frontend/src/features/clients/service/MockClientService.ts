import { ICliente } from "../types/Cliente";
import { CLIENT } from "../mocks/ClientMock";
import { BaseMockService } from "@/components/service/BaseMockService";
export class MockClientSerivce extends BaseMockService<ICliente> {
  constructor() {
    super(CLIENT);
  }


}