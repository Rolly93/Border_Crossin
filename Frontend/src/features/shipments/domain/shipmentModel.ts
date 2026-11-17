/** @format */

import {
  TConsolidateGuideItemRequest,
  TEventCategory,
  TShipmentEvent,
  TShipmentRequest,
  TShipmentResponse,
} from "../hooks/useShipments";

export interface EventFieldConfig {
  key: TEventCategory;
  showNotes?: boolean;
  maxNotesLength?: number;
  notesLabel?: string;
}

export const EVENT_FIELDS: EventFieldConfig[] = [
  { key: "pick_up" },
  { key: "departure" },
  { key: "delay", showNotes: true, maxNotesLength: 50 },
  { key: "mex_inspeccion", showNotes: true, maxNotesLength: 25 },
  { key: "clear_mex" },
  { key: "usa_inspeccion", showNotes: true, maxNotesLength: 25 },
  { key: "clear_usa" },
  { key: "safety_yard", showNotes: true, maxNotesLength: 25 },
  { key: "deliver", showNotes: true, maxNotesLength: 25 },
];

export const EXPECTED_CATEGORIES: TEventCategory[] = EVENT_FIELDS.map(
  (f) => f.key,
);

export class ShipmentModel {
  public readonly data: TShipmentResponse;

  constructor(
    rawShipment?: TShipmentResponse,
    expectedCategories: TEventCategory[] = EXPECTED_CATEGORIES,
  ) {
    this.data = this.normalizeShipmentData(rawShipment, expectedCategories);
  }

  private getEvent(categoryKey: TEventCategory) {
    return this.data.events?.find((e) => e.category === categoryKey);
  }

  public getEventDate(categoryKey: TEventCategory): string {
    const event = this.getEvent(categoryKey);
    if (!event?.dateTime) {
      return "--";
    }

    return new Date(event.dateTime)
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  }

  public getNotes(categoryKey: TEventCategory): string {
    const event = this.getEvent(categoryKey);
    return event?.notes || "--";
  }

  static prepareInitialEvents(
    existingEvents: TShipmentEvent[] | null = [],
    expectedCategories: TEventCategory[] = EXPECTED_CATEGORIES,
  ): TShipmentEvent[] {
    const safeEvents = existingEvents ?? [];

    return expectedCategories.map((category) => {
      const found = safeEvents.find((e) => e.category === category);
      return found ?? { category, dateTime: "", notes: "" };
    });
  }

  private normalizeShipmentData(
    initialShipment?: TShipmentResponse,
    expectedCategories: TEventCategory[] = EXPECTED_CATEGORIES,
  ): TShipmentResponse {
    const baseValues = {
      id: initialShipment?.id ?? 0,
      tracking_number: initialShipment?.tracking_number ?? "",
      customer_tracking: initialShipment?.customer_tracking ?? "",
      cliente: initialShipment?.cliente ?? 0,
      truck: initialShipment?.truck ?? "",
      origen: initialShipment?.origen ?? "",
      destination: initialShipment?.destination ?? "",
      type_operation: initialShipment?.type_operation ?? "northbound",
      events: ShipmentModel.prepareInitialEvents(
        initialShipment?.events,
        expectedCategories,
      ),
    };

    if (initialShipment?.service_type === "consolidated") {
      return {
        ...baseValues,
        service_type: "consolidated",
        consolidate_guide:
          initialShipment.consolidate_guide &&
          initialShipment.consolidate_guide.map(
            (guide: TConsolidateGuideItemRequest) => ({
              client_id: this.data.cliente ? Number(this.data.cliente) : 0,
              guide_number: guide.guide_number,
              pieces: guide.pieces,
              weight: guide.weight,
            }),
          ),
      };
    }

    return {
      ...baseValues,
      service_type: "trailer",
      trailer_number: "",
      plates: "",
      state: "",
      seal: "",
    };
  }

  public toCreateFormValues(
    existingGuides: TConsolidateGuideItemRequest[] = [],
  ): TShipmentRequest {
    const { data } = this;

    const base = {
      tracking_number: data.tracking_number,
      customer_tracking: data.customer_tracking,
      type_operation: data.type_operation,
      cliente: data.cliente,
      truck: data.truck,
      origen: data.origen,
      destination: data.destination,
    };

    if (data.service_type === "trailer") {
      return {
        ...base,
        service_type: "trailer",
        trailer_number: data.trailer_number,
        seal: data.seal,
        state: data.state,
        plates: data.plates,
      };
    }

    return {
      ...base,
      service_type: "consolidated",
      consolidate_guide: existingGuides.map((guide) => ({
        client_id: guide.client_id != null ? Number(guide.client_id) : null,
        guide_number: guide.guide_number,
        pieces: guide.pieces,
        weight: guide.weight,
      })),
    };
  }

  public static toCreatePayloads(values: TShipmentRequest): TShipmentRequest {
    const client_id = Number(values.cliente);
    if (values.service_type === "consolidated") {
      return {
        tracking_number: values.tracking_number,
        customer_tracking: values.customer_tracking,
        type_operation: values.type_operation,
        service_type: "consolidated",
        cliente: client_id,
        truck: values.truck,
        origen: values.origen,
        destination: values.destination,
        consolidate_guide: values.consolidate_guide.map(
          (guide: TConsolidateGuideItemRequest) => ({
            client_id: client_id,
            guide_number: guide.guide_number,
            pieces: guide.pieces,
            weight: guide.weight,
          }),
        ),
      };
    }
    return {
      tracking_number: values.tracking_number,
      customer_tracking: values.customer_tracking,
      type_operation: values.type_operation,
      service_type: "trailer",
      cliente: client_id,
      truck: values.truck,
      origen: values.origen,
      destination: values.destination,
      plates: values.plates,
      seal: values.seal,
      state: values.state,
      trailer_number: values.trailer_number,
    };
  }
}
