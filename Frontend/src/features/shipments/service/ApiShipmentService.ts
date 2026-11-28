/** @format */

import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { PaginatedResponse } from "@/components/service/IBaseService";
import { getErrorMessage } from "@/components/utils/errorMessage";
import {
  TShipmentRequest,
  TShipmentResponse,
  TShipmentUpdate,
} from "../hooks/useShipments";

export class ApiShipmentService extends BaseCrudApiService<
  TShipmentResponse,
  TShipmentUpdate,
  TShipmentRequest
> {
  constructor() {
    super("shipment");
  }

  override async insert(data: TShipmentRequest): Promise<TShipmentResponse> {
    try {
      console.log(data);

      const response = await this.api.post<TShipmentResponse>(
        `/${this.resourcePath}/create`,
        data,
      );
      console.log(response.data);

      return response.data;
    } catch (err) {
      console.log(err);

      throw new Error(getErrorMessage(err, "No se pudo registrar el embarque"));
    }
  }

  async getPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<TShipmentResponse>> {
    try {
      const response = await this.api.get<PaginatedResponse<TShipmentResponse>>(
        `/${this.resourcePath}/`,
        { params: { page, limit } },
      );
      if (response.status === 200) {
        return response.data;
      }
      return {
        page: response.data.page,
        hasNextPage: response.data.hasNextPage,
        totalRecords: response.data.totalRecords,
        limit: response.data.limit,
        data: response.data.data,
      };
    } catch (error: any) {
      console.log(error);
      throw error.message;
    }
  }

  // Backend: PUT /shipment/{id}/update
  override async update(
    id: number,
    data: TShipmentUpdate,
  ): Promise<TShipmentResponse> {
    try {
      // El formulario rellena las 9 categorías; las vacías no son eventos y el
      // backend las rechaza (dateTime es obligatorio).
      const payload = {
        ...data,
        events: (data.events ?? []).filter((e) => Boolean(e.dateTime)),
      };
      const response = await this.api.put<TShipmentResponse>(
        `/${this.resourcePath}/${id}/update`,
        payload,
      );
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error.message;
    }
  }

  // Backend: PATCH /shipment/{id}/delete
  async delete(id: number): Promise<TShipmentResponse> {
    try {
      const response = await this.api.patch<TShipmentResponse>(
        `/${this.resourcePath}/${id}/delete`,
      );
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error.message;
    }
  }
}
