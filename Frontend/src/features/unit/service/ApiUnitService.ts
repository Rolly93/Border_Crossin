/** @format */

import { BaseApiService } from "@/components/service/BaseApiService";
import {

  IUnitAssignment,
} from "../type/unit.interface";
import { TAssignResponse, TUnitRequest, TUnitRespose } from "../hook/useUnits";

export class ApiUnitService extends BaseApiService {
  constructor() {
    super("/unit");
  }

  async list(): Promise<TUnitRespose[]> {
    try {
      const { data } = await this.api.get<TUnitRespose[]>(
        `${this.resourcePath}/`,
      );

      return data;
    } catch (e: any) {
      console.log(e);
      throw e.message
    }
  }

  async create(input: TUnitRequest): Promise<TUnitRequest> {
    try {
      const { data } = await this.api.post<TUnitRequest>(
        `${this.resourcePath}/create`,
        input,
      );

      return data;
    } catch (e: any) {
      console.log(e.message);
      throw e.message
    }
  }

  async update(id: number, input: TUnitRequest): Promise<TUnitRespose> {


    try {
      const { data } = await this.api.put<TUnitRespose>(
        `${this.resourcePath}/update/${id}`,
        input,
      );
      return data;
    } catch (error: any) {
      console.log(error);
      throw error.message

    }
  }

  async assign(unitId: number, driverId: number): Promise<TAssignResponse> {
    try {
      const { data } = await this.api.post<TAssignResponse>(
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

  async history(unitId: number): Promise<TAssignResponse[]> {
    try {
      const { data } = await this.api.get<TAssignResponse[]>(
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
