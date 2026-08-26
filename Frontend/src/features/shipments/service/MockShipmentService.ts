import { Shipment } from "@/features/shipments/types/Shipment";

import { LOADSHIPMENT } from "@/features/shipments/mocks/shipmentsMock";
import { BaseMockService } from "@/components/service/BaseMockService";
export class MockShipmentService extends BaseMockService<Shipment> {
    constructor() {
        super(LOADSHIPMENT);
    }
    override async insert(data: Shipment): Promise<Shipment> {
        const newShipment = await super.insert({
            ...data, events: data.events || []
        })
        return newShipment
    }
}