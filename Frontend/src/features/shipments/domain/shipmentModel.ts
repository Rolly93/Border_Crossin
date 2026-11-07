import { TEventCategory, TShipmentBase, TShipmentEvent } from "../hooks/useShipments";

export class ShipmentModel {
  constructor(public readonly data: TShipmentBase) { }

  private getEvent(categoryKey: TEventCategory) {

    return this.data.events?.find(e => e.category === categoryKey);
  }

  public getEventDate(categoryKey: TEventCategory): string {
    const event = this.getEvent(categoryKey);
    if (!event || !event.dateTime) {
      return '--';
    }

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

  public getNotes(categoryKey: TEventCategory): string {


    const event = this.getEvent(categoryKey);
    return event?.notes || '--';
  }

  static prepareInitialEvents(existingEvents: TShipmentEvent[] | null = [], expectedCategories: string[]): TShipmentEvent[] {
    const safeEvents = existingEvents ?? [];

    return expectedCategories.map(category => {
      const found = safeEvents.find(e => e.category === category);
      return found || { category: category as any, dateTime: "", notes: '' };
    });

  }


}