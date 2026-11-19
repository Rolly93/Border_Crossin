/** @format */

import {
  IBaseService,
  PaginatedResponse,
} from "@/components/service/IBaseService";
import {
  TShipmentResponse,
  TShipmentUpdate,
  TShipmentRequest,
  TEventCategory,
  TConsolidateGuideItemRequest,
} from "../hooks/useShipments";

export interface EventFieldConfig {
  key: TEventCategory;
  showNotes?: boolean;
  maxNotesLength?: number;
  notesLable?: string;
}

export interface TShipmentCreateFormValues {
  tracking_number: string;
  customer_tracking: string;
  type_operation: "northbound" | "southbound";
  service_type: "consolidated" | "trailer_53ft";
  cliente: number;
  truck: string;
  trailer_number: string;
  seal: string;
  plates: string;
  state: string;
  consolidate_guide: TConsolidateGuideItemRequest[];
  origen: string;
  destination: string;
}





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
