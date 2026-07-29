import { Shipment } from "@/types/Shipment";
import { BaseShipemntService } from "./BaseShipmentService";
import { IShipmentService } from "./IShipmentService";
import { LOADSHIPMENT } from "@/mocks/shipmentsMock";
export class MockShipmentService extends BaseShipemntService implements IShipmentService{
    async getAll(): Promise<Shipment[]> {
        await this.delay(600);
        return [...LOADSHIPMENT]
    }
    async update(id: number, data: Shipment): Promise<Shipment> {
        await this.delay(100);
        const index = LOADSHIPMENT.findIndex(item =>item.id == id);
        if (index !==-1) LOADSHIPMENT[index] ={...data}
        return data
    }
    async insert(data: Shipment): Promise<Shipment> {
        await this.delay(100);
        const nextId = LOADSHIPMENT.length>0? Math.max(...LOADSHIPMENT.map(i=>i.id))+1 :1;
        const newShipment = {...data , id:nextId , events:data.events || []};
        return newShipment;
    }

}