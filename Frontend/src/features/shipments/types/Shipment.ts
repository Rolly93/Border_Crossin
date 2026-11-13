/** @format */

import {
  IBaseService,
  PaginatedResponse,
} from "@/components/service/IBaseService";
import {
  TShipmentResponse,
  TShipmentUpdate,
  TShipmentRequest,
} from "../hooks/useShipments";

export interface IShipmentService extends IBaseService<
  TShipmentResponse,
  TShipmentUpdate,
  TShipmentRequest
> {
  insert(data: TShipmentRequest): Promise<TShipmentResponse>;
  getPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<TShipmentResponse>>;
  update(id: number, data: TShipmentUpdate): Promise<TShipmentResponse>;
  delete(id: number): Promise<TShipmentResponse>;
}
