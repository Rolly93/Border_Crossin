import { Shipment } from "@/features/shipments/types/Shipment";

import { LOADSHIPMENT } from "@/features/shipments/mocks/shipmentsMock";
import { BaseMockService } from "@/components/service/BaseMockService";
import { EventCategory, ShipmentEvent } from "@/types/Shipment";
import { notificationsStreamService } from "@/features/notfications/services/NotificationService";
import { PaginatedResponse } from "@/components/service/IBaseService";

const CATEGORY_LABELS: Record<EventCategory, string> = {
    pick_up: 'Recolección',
    departure: 'Salida de Origen',
    delay: 'Retraso',
    mex_inspeccion: 'Inspección México',
    clear_mex: 'Despacho México',
    usa_inspeccion: 'Inspección USA',
    clear_usa: 'Despacho USA',
    safety_yard: 'Patio de Seguridad',
    deliver: 'Entrega Final',

}
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

    override async update(id: number, data: Shipment): Promise<Shipment> {
        await this.delay(100);

        const index = this.mockData.findIndex((item) => item.id === id);


        const targetEvent = data.events.find((event) => event.dateTime !== null && event.dateTime !== undefined)

        if (index !== -1) {
            const updatedItem = { ...this.mockData[index], ...data, id }
            if (targetEvent) {
                this.triggerSftpSimulation(id, targetEvent)
            }
            this.mockData[index] = updatedItem;

            return updatedItem;

        }
        throw new Error("Item not Found");
    }
    private triggerSftpSimulation(shipmentId: number, event?: ShipmentEvent) {
        const eventName = event ? (CATEGORY_LABELS[event.category] || event.category) : 'General'

        setTimeout(() => {
            notificationsStreamService.emitMockEvent?.({
                shipment_id: shipmentId,
                status: 'SUCCESS',
                message: `[MOCK] Archivo XML del evento "${eventName}" enviado por SFTP (Embarque #${shipmentId}).`,
            });
        }, 2500)
    }
    async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Shipment>> {
        await this.delay(1000);
        const safeData = Array.isArray(this.items) ? this.items : [];

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const data = safeData.slice(startIndex, endIndex);
        return {
            data,
            totalRecords: safeData.length,
            hasNextPage: endIndex < safeData.length,
            page, limit
        }
    }
}