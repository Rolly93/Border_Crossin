import { Shipment , EventCategory, ShipmentEvent } from "@/types/Shipment";

export class ShipmentModel{
    constructor(public readonly data: Shipment) {}

    private getEvent(categoryKey: EventCategory) {
  
    return this.data.events?.find(e => e.category === categoryKey);
  }

  public getEventDate(categoryKey: EventCategory): string {
    const event = this.getEvent(categoryKey);
    if (!event || !event.dateTime) return '--';
    
    return new Date(event.dateTime)
    .toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(',', '');
  }
  public getNotes(categoryKey: EventCategory): string {

    
    const event = this.getEvent(categoryKey);
    return event?.notes || '--';
  }

static prepareInitialEvents(existingEvents: ShipmentEvent[] = [], expectedCategories: string[]): ShipmentEvent[] {
  return expectedCategories.map(category => {
      const found = existingEvents.find(e => e.category === category);
      return found || { category: category as any, dateTime: null, notes: '' };
    });

 }
}