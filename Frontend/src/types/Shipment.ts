

export interface Shipment{
    id : number;
    trcking_Number : string;
    costumer_tracking : string;
    cliente:string;
    truck:string;
    vehicleType : string;
    trailer : string;
    orgien:string,
    destino:string,
    type_operation:string,
    status:string;
    events: ShipmentEvent[];


}

export interface ShipmentEvent{
    category:EventCategory;
    dateTime:Date|null;
    notes?:string;
}
export type EventCategory = 
  | "pick_up" 
  | "departure" 
  | "delay"
  | "mex_inspeccion" 
  | "clear_mex" 
  | "usa_inspeccion" 
  | "clear_usa"
  |"safety_yard" 
  | "deliver";


export interface ShipmentCreate{

    trcking_Number : string;
    costumer_tracking : string;
    cliente:string;
    truck:string;
    vehicleType : string;
    trailer : string;
    orgien:string,
    destino:string,
    type_operation:string,

}