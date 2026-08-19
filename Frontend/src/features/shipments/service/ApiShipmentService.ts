import { Shipment } from "@/features/shipments/types/Shipment";
import { BaseApiService } from "@/components/service/BaseApiService";

export class ApiShipmentService extends BaseApiService<Shipment> {
    constructor() {
        super('shipment')
    }
}