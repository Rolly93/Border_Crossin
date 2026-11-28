/** @format */

import {
  TConsolidateGuideItemRequest,
  TConsolidateGuideItemResponse,
  TEventCategory,
  TShipmentEvent,
  TShipmentRequest,
  TShipmentResponse,
} from "../hooks/useShipments";
import { TShipmentCreateFormValues } from "../types/Shipment";

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
    const rawClient = initialShipment?.cliente;
    const resolvedClient =
      rawClient !== undefined && rawClient !== null ? String(rawClient) : "";

    const baseValues = {
      id: initialShipment?.id ?? 0,
      tracking_number: initialShipment?.tracking_number ?? "",
      customer_tracking: initialShipment?.customer_tracking ?? "",
      cliente: resolvedClient,
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
        assignation: initialShipment.assignation,
        service_type: "consolidated",
        consolidate_guide:
          initialShipment.consolidate_guide &&
          initialShipment.consolidate_guide.map(
            (guide: TConsolidateGuideItemResponse) => ({
              id: guide.id,
              client_id: guide.client_id,
              guide_number: guide.guide_number,
              pieces: guide.pieces,
              weight: guide.weight,
            }),
          ),
      };
    }
    if (initialShipment?.service_type === "trailer_53ft") {
      return {
        ...baseValues,
        service_type: "trailer_53ft",

        assignation: initialShipment.assignation,
        trailer_number: initialShipment.trailer_number,
        plates: initialShipment.plates,
        seal: initialShipment.seal,
        state: initialShipment.state,
      };
    }

    return {
      ...baseValues,

      assignation: "",
      service_type: "trailer_53ft",
      trailer_number: "",
      plates: "",
      state: "",
      seal: "",
    };
  }

  public toCreateFormValues(
    existingGuides: TConsolidateGuideItemRequest[] = [],
  ): TShipmentCreateFormValues {
    const { data } = this;
    const isConsolidate = data.service_type === "consolidated";
    const guidesFromMode = isConsolidate ? data.consolidate_guide : [];
    const resolvedGuides =
      existingGuides.length > 0 ? existingGuides : guidesFromMode;

    return {
      tracking_number: data.tracking_number,
      customer_tracking: data.customer_tracking,
      type_operation: data.type_operation,
      cliente: data.cliente,
      truck: data.truck,
      origen: data.origen,
      destination: data.destination,
      service_type: data.service_type,
      trailer_number: !isConsolidate ? data.trailer_number : "",
      seal: !isConsolidate ? data.seal : "",
      state: !isConsolidate ? data.state : "",
      plates: !isConsolidate ? data.plates : "",
      consolidate_guide:
        resolvedGuides.length > 0
          ? resolvedGuides
          : [
              {
                client_id: data.cliente,
                guide_number: "",
                pieces: 1,
                weight: 1,
                id: 1,
              },
            ],
    };
  }

  public static toCreatePayloads(values: TShipmentRequest): TShipmentRequest {
    const client_id =
      values.cliente !== null && values.cliente !== undefined
        ? Number(values.cliente)
        : 0;

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
      service_type: "trailer_53ft",
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
