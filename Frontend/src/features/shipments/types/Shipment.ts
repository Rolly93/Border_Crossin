/** @format */

import {
  IBaseService,
  PaginatedResponse,
} from "@/components/service/IBaseService";
import { TShipmentBase, TShipmentCreateRequest, TShipmentUpdate } from "../hooks/useShipments";

export interface Shipment extends ShipmentCreate {
  id: number;
  status?: string;
  create?: Date;
  events: ShipmentEvent[];
}

export interface ShipmentEvent {
  category: EventCategory;
  dateTime: Date | null;
  notes?: string;
}

export type EventCategory =
  | "pick_up"
  | "departure"
  | "delay"
  | "mex_inspeccion"
  | "clear_mex"
  | "usa_inspeccion"
  | "clear_usa"
  | "safety_yard"
  | "deliver";

export interface ShipmentCreate {
  tracking_number: string;
  customer_tracking: string;
  cliente: string;
  truck: string;
  vehicle_type: string;
  trailer: string;
  origen: string;
  destination: string;
  type_operation: string;
}

export interface ShipmentUpdate {
  tracking_number?: string;
  customer_tracking?: string;
  cliente: number;
  truck?: string;
  vehicle_type?: string;
  trailer?: string;
  origen?: string;
  destination: string;
  type_operation?: string;
  events: ShipmentEvent[] | ShipmentEvent;
}

export interface IShipmentService extends IBaseService<
  TShipmentBase,
  TShipmentUpdate, TShipmentCreateRequest
> {
  insert(data: TShipmentCreateRequest): Promise<TShipmentBase>;
  getPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<TShipmentBase>>;
  update(id: number, data: TShipmentUpdate): Promise<TShipmentBase>;
  delete(id: number): Promise<TShipmentBase>;
}
