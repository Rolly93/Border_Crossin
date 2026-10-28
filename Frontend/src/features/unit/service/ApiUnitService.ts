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
    } catch (e: any) {
      console.log(e);
      throw e.message
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
    } catch (e: any) {
      console.log(e.message);
      throw e.message
    }
  }

  async update(id: number, input: IUnitInput): Promise<IUnit> {
    try {
      const { data } = await this.api.put<IUnit>(
        `${this.resourcePath}/update/${id}`,
        input,
      );
      return data;
    } catch (error: any) {
      console.log(error.message);
      throw error

    }
  }

  async assign(unitId: number, driverId: number): Promise<IUnitAssignment> {
    try {
      const { data } = await this.api.post<IUnitAssignment>(
        `${this.resourcePath}/${unitId}/assign`,
        { driverId },
      );
      return data;
    } catch (error: any) {
      console.log(error);
      throw error.message

    }
  }

  async release(unitId: number): Promise<void> {
    try {
      await this.api.post(`${this.resourcePath}/${unitId}/release`);

    } catch (error: any) {
      console.log(error);
      throw error.message
    }
  }

  async history(unitId: number): Promise<IUnitAssignment[]> {
    try {
      const { data } = await this.api.get<IUnitAssignment[]>(
        `${this.resourcePath}/${unitId}/history`,
      );
      return data;
    } catch (error: any) {
      console.log(error);
      throw error.message
    }
  }
}

export const unitService = new ApiUnitService();
