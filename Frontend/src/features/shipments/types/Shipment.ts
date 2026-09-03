import { IBaseService, PaginatedResponse } from "@/components/service/IBaseService";


export interface Shipment extends ShipmentCreate {
    id: number;
    status?: string;
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
    origen: string,
    destino: string,
    type_operation: string,

}




export interface IShipmentService extends IBaseService<Shipment> {

    getPaginated(page: number, limit: number): Promise<PaginatedResponse<Shipment>>;

}
