/** @format */

import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { PaginatedResponse } from "@/components/service/IBaseService";
import { getErrorMessage, toApiError } from "@/components/utils/errorMessage";
import {
  TShipmentRequest,
  TShipmentResponse,
  TShipmentUpdate,
} from "../hooks/useShipments";

type TServiceType = TShipmentRequest["service_type"];

// api.d.ts solo aporta tipos (no existen en runtime). El Record obliga a listar
// exactamente los service_type generados: si el backend agrega uno y se corre
// `generate:api`, esto deja de compilar hasta agregarlo.
const SERVICE_TYPE_TAGS_MAP: Record<TServiceType, true> = {
  trailer_53ft: true,
  consolidated: true,
};
// Tags de la unión discriminada por service_type que FastAPI mete en `loc`.
const SERVICE_TYPE_TAGS = Object.keys(SERVICE_TYPE_TAGS_MAP) as TServiceType[];

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
      const response = await this.api.post<TShipmentResponse>(
        `/${this.resourcePath}/create`,
        data,
      );
      return response.data;
    } catch (err) {
      throw toApiError(err, "No se pudo registrar el embarque", SERVICE_TYPE_TAGS);
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
      return response.data;
    } catch (err) {
      throw new Error(
        getErrorMessage(err, "No se pudieron cargar los embarques"),
      );
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
    } catch (err) {
      throw toApiError(err, "No se pudo actualizar el embarque", SERVICE_TYPE_TAGS);
    }
  }

  // Backend: PATCH /shipment/{id}/delete
  async delete(id: number): Promise<TShipmentResponse> {
    try {
      const response = await this.api.patch<TShipmentResponse>(
        `/${this.resourcePath}/${id}/delete`,
      );
      return response.data;
    } catch (err) {
      throw new Error(getErrorMessage(err, "No se pudo eliminar el embarque"));
    }
  }
}
