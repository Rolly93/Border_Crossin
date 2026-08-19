import { Shipment } from "@/types/Shipment";

export interface IShipmentService {
    getAll(): Promise <Shipment[]>;
    update(id:number,data:Shipment) : Promise<Shipment>;
    insert(data : Shipment) : Promise<Shipment>;
}