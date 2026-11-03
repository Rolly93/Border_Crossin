/** @format */

import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { PaginatedResponse } from "@/components/service/IBaseService";
import { getErrorMessage } from "@/components/utils/errorMessage";
import { TShipmentBase, TShipmentCreateRequest, TShipmentUpdate } from "../hooks/useShipments";

export class ApiShipmentService extends BaseCrudApiService<
  TShipmentBase,
  TShipmentUpdate, TShipmentCreateRequest
> {
  constructor() {
    super("shipment");
  }

  /**
   * Traduce el formulario (cliente en texto, destino en español) al contrato del backend.
   * Es el único lugar donde se hace esta traducción.
   */
  override async insert(data: TShipmentCreateRequest): Promise<TShipmentBase> {

    try {
      const response = await this.api.post<TShipmentBase>(
        `/${this.resourcePath}/create`,
        data,
      );

      return response.data
    } catch (err) {
      throw new Error(getErrorMessage(err, "No se pudo registrar el embarque"));
    }
  }

  async getPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<TShipmentBase>> {
    try {
      const response = await this.api.get<PaginatedResponse<TShipmentBase>>(
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
      throw error.message
    }
  }

  // Backend: PUT /shipment/{id}/update
  override async update(id: number, data: TShipmentUpdate): Promise<TShipmentBase> {
    try {
      const response = await this.api.put<TShipmentBase>(
        `/${this.resourcePath}/${data.id}/update`,
        data,
      );
      return response.data;



    } catch (error: any) {
      console.log(error);
      throw error.message
    }
  }

  // Backend: PATCH /shipment/{id}/delete
  async delete(id: number): Promise<TShipmentBase> {
    try {
      const response = await this.api.patch<TShipmentBase>(
        `/${this.resourcePath}/${id}/delete`,
      );
      return response.data;



    } catch (error: any) {
      console.log(error);
      throw error.message
    }
  }
}
