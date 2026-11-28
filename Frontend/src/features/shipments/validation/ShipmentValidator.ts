/** @format */

import { getEventSequence } from "../domain/shipmentModel";
import { TEventCategory, TShipmentEvent } from "../hooks/useShipments";

const REQUIERE_EVENTS = new Set<TEventCategory>([
  "pick_up",
  "departure",
  "clear_mex",
  "clear_usa",
  "deliver",
]);
type TValidatorInput = {
  tracking_number?: string;
  customer_tracking?: string;
  truck?: string;
  origen?: string;
  destination?: string;
  type_operation?: string;
  events?: TShipmentEvent[] | null;
};

export class ShipmentValidator {
  private data: TValidatorInput;
  constructor(formData: TValidatorInput) {
    this.data = formData;
  }

  /** Orden cronológico esperado: depende del sentido (north/southbound). */
  private get eventSequence(): TEventCategory[] {
    return getEventSequence(this.data.type_operation);
  }

  public validateTrackingNumber(): string | null {
    return (this.data.tracking_number?.trim().length || 0) < 5
      ? "No. Embarque Invalido"
      : null;
  }

  public validateCustomerTracking(): string | null {
    return (this.data.customer_tracking?.trim().length || 0) < 5
      ? "No. Cliente Invalido"
      : null;
  }

  public validateTruck(): string | null {
    return (this.data.truck?.trim().length || 0) === 0
      ? "Undiad Invalida"
      : null;
  }

  public validateOrigin(): string | null {
    return (this.data.origen?.trim().length || 0) < 5
      ? "Origen Invalido"
      : null;
  }

  public validateDestination(): string | null {
    return (this.data.destination?.trim().length || 0) < 3
      ? "Destino Invalido"
      : null;
  }

  public validateTypeOperation(): string | null {
    return (this.data.type_operation?.trim().length || 0) < 3
      ? "Pick Southbound or Northbound"
      : null;
  }
  public validateEventChronology(): Record<string, string> {
    const currentEvents = this.data?.events || [];

    return {
      ...this.ValidateMissingRequiereEvents(currentEvents),
      ...this.validateChronologicalOrder(currentEvents),
    };
  }
  private validateChronologicalOrder(
    currentEvents: any[],
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!currentEvents || !Array.isArray(currentEvents)) {
      return errors;
    }

    const activeEvents = currentEvents
      .filter(
        (event): event is typeof event & { dateTime: string | Date } =>
          !!event.dateTime && !!event.category,
      )
      .sort((a, b) => {
        const sequence = this.eventSequence;
        const indexA = sequence.indexOf(a.category as TEventCategory);
        const indexB = sequence.indexOf(b.category as TEventCategory);
        return indexA - indexB;
      });

    for (let i = 0; i < activeEvents.length - 1; i++) {
      const currentEvent = activeEvents[i];
      const nextEvent = activeEvents[i + 1];

      const currentDate = new Date(currentEvent.dateTime!).getTime();
      const nextDate = new Date(nextEvent.dateTime!).getTime();

      if (isNaN(currentDate) || isNaN(nextDate)) {
        continue;
      }

      if (nextDate < currentDate) {
        const realIndex = currentEvents.findIndex(
          (e) => e.category === nextEvent.category,
        );
        if (realIndex !== -1) {
          errors[`events.${realIndex}.dateTime`] =
            `Evento "${this.FieldsName(nextEvent.category)}" no puede ser antes "${this.FieldsName(currentEvent.category)}"`;
        }
      }
    }

    return errors;
  }

  private ValidateMissingRequiereEvents(
    currentEvents: any[],
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!currentEvents || !Array.isArray(currentEvents)) {
      return errors;
    }

    const eventMap = new Map<string, Date | null>();
    for (const event of currentEvents) {
      const dateVal = event.dateTime ? new Date(event.dateTime) : null;
      eventMap.set(event.category, dateVal);
    }

    const sequence = this.eventSequence;
    let latestFillIndex = -1;
    for (let i = sequence.length - 1; i >= 0; i--) {
      const category = sequence[i];
      if (eventMap.get(category)) {
        latestFillIndex = i;
        break;
      }
    }

    if (latestFillIndex !== -1) {
      for (let i = 0; i < latestFillIndex; i++) {
        const category = sequence[i];
        const isRequire = REQUIERE_EVENTS.has(category);
        const hasDate = !!eventMap.get(category);

        if (isRequire && !hasDate) {
          const latestCategoryFilled = sequence[latestFillIndex];
          const realIndex = currentEvents.findIndex(
            (e) => e.category === latestCategoryFilled,
          );

          if (realIndex !== -1) {
            errors[`events.${realIndex}.dateTime`] =
              `No puedes registrar "${this.FieldsName(latestCategoryFilled)}" si hace falta llenar el campo obligatorio anterior "${this.FieldsName(category)}"`;
          }
        }
      }
    }

    return errors;
  }

  private FieldsName(fieldName: string): string {
    let displayName = fieldName;
    switch (fieldName) {
      case "pick_up":
        displayName = " Recoleccion";
        break;
      case "departure":
        displayName = " Salida de patio";
        break;
      case "delay":
        displayName = " retraso";
        break;
      case "mex_inspeccion":
        displayName = " inspeccion Mexican";
        break;
      case "clear_mex":
        displayName = "Liberacion Aduana Mexicana";
        break;
      case "usa_inspeccion":
        displayName = "Inspeccion Aduana Usa";
        break;
      case "clear_usa":
        displayName = "Liberacion Aduana Americana";
        break;
      case "safety_yard":
        displayName = "Resguardo de yarda";
        break;
      case "deliver":
        displayName = "Entrega";
        break;
      default:
        break;
    }
    return displayName;
  }
}
