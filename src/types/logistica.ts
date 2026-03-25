export interface Shipment{
    id : string;
    my_reference : string;
    cliente_reference : string;
    truck:string;
    client: string;
    vehicleType : string;
    trailer : string;
    scac: string;
    orgien:string,
    destino:string
    status:string;
    events: ShipmentEvent[];

}

export interface ShipmentEvent{
    category:EventCategory;
    time:string;
    date:string;
    notes?:string
}
export type EventCategory = 
  | "PICK UP" 
  | "DEPARTURE" 
  | "CLEAR MEX" 
  | "MEX INSPECCION" 
  | "USA INSPECCION" 
  | "CLEAR USA" 
  | "DELIVERY";