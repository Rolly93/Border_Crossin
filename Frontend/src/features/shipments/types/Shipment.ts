/** @format */

import {
  IBaseService,
  PaginatedResponse,
} from "@/components/service/IBaseService";
import {
  TShipmentBase,
  TShipmentCreateRequest,
  TShipmentUpdate,
} from "../hooks/useShipments";

export interface IShipmentService extends IBaseService<
  TShipmentBase,
  TShipmentUpdate,
  TShipmentCreateRequest
> {
  insert(data: TShipmentCreateRequest): Promise<TShipmentBase>;
  getPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<TShipmentBase>>;
  update(id: number, data: TShipmentUpdate): Promise<TShipmentBase>;
  delete(id: number): Promise<TShipmentBase>;
}
