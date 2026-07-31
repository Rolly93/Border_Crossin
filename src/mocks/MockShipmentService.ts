import { notificationsStreamService } from "@/service/NotificationService";
import { IShipmentService } from "@/service/shipment/IShipmentService";
import { EventCategory, Shipment, ShipmentEvent } from "@/types/Shipment";

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
};

export class MockShipmentService implements IShipmentService {
  private mockData: Shipment[] = [];


  async getAll(): Promise<Shipment[]> {
    return [];
  }

async insert(values: Shipment): Promise<Shipment> {
    this.mockData.push(values); 
    return values;
  }


  async update(id: number | string, values: Partial<Shipment>): Promise<Shipment> {
    console.log(values)
    const index = this.mockData.findIndex((s) => s.id === Number(id));
    const targetEvent = values.events?.find((event) => event.dateTime !== null);
    
    if (index !== -1) {
      this.mockData[index] = { ...this.mockData[index], ...values };
      if (targetEvent) { 
        this.triggerSftpSimulation(Number(id), targetEvent);
      }

      return this.mockData[index];
    }

    throw new Error(`[MOCK] Error: Embarque con ID ${id} no encontrado.`);
  }
  async sendXml(id: number | string, date: string): Promise<void> {
    this.triggerSftpSimulation(Number(id));
  }

  private triggerSftpSimulation(shipmentId: number, event?: ShipmentEvent) {
    const eventName = event ? (CATEGORY_LABELS[event.category] || event.category) : 'General';

    setTimeout(() => {
      notificationsStreamService.emitMockEvent?.({
        shipment_id: shipmentId,
        status: 'SUCCESS',
        message: `[MOCK] Archivo XML del evento "${eventName}" enviado por SFTP (Embarque #${shipmentId}).`,
      });
    }, 2500);
  }
}