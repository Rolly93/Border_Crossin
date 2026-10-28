/** @format */

import { BaseApiService } from "@/components/service/BaseApiService";
import {
  IUnit,
  IUnitAssignment,
  IUnitInput,
  IUnitResponse,
} from "../type/unit.interface";

export class ApiUnitService extends BaseApiService {
  constructor() {
    super("/unit");
  }

  async list(): Promise<IUnitResponse[]> {
    try {
      const { data } = await this.api.get<IUnitResponse[]>(
        `${this.resourcePath}/`,
      );

      return data;
    } catch (e) {
      console.log(e);
    }
  }

  async create(input: IUnitInput): Promise<IUnit> {
    try {
      const { data } = await this.api.post<IUnit>(
        `${this.resourcePath}/create`,
        input,
      );
      console.log(data);

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async update(id: number, input: IUnitInput): Promise<IUnit> {
    const { data } = await this.api.put<IUnit>(
      `${this.resourcePath}/update/${id}`,
      input,
    );
    return data;
  }

  async assign(unitId: number, driverId: number): Promise<IUnitAssignment> {
    const { data } = await this.api.post<IUnitAssignment>(
      `${this.resourcePath}/${unitId}/assign`,
      { driverId },
    );
    return data;
  }

  async release(unitId: number): Promise<void> {
    await this.api.post(`${this.resourcePath}/${unitId}/release`);
  }

  async history(unitId: number): Promise<IUnitAssignment[]> {
    const { data } = await this.api.get<IUnitAssignment[]>(
      `${this.resourcePath}/${unitId}/history`,
    );
    return data;
  }
}

export const unitService = new ApiUnitService();
