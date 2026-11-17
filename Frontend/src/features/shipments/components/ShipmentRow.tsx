/** @format */

import { Table } from "@mantine/core";
import { ShipmentModel } from "../domain/shipmentModel";
import { forwardRef } from "react";
import {
  TConsolidateGuideItemRequest,
  TShipmentResponse,
} from "../hooks/useShipments";

interface ShipmentRowProps {
  shipment: TShipmentResponse;
  onRowDoubleClick: (element: TShipmentResponse) => void;
}

interface IShipmentData {
  costumer_tracking: string;
  tracking_Trailer: string;
  trailer: string | null;
  service_type: "trailer" | "consolidated";
  consolidate_guide: TConsolidateGuideItemRequest[];
  truck: string;
  client: string;
  type_operation: "northbound" | "southbound";
  assignation: string | null;
  origen: string;
  destination: string;
  pickup: string;
  departure: string;
  clear_mex: string;
  mex_inspection: string;
  mex_seal: string;
  usa_inspection: string;
  usa_seal: string;
  clear_usa: string;
  deliver: string;
  deliver_notes: string;
}

const displayDataShipment = (model: ShipmentModel): IShipmentData => {
  const { data } = model;
  const isConsolidated = data.service_type === "consolidated";
  return {
    tracking_Trailer: data.tracking_number,
    costumer_tracking: data.customer_tracking,
    assignation: null, //data.created
    trailer: data.tracking_number,
    service_type: data.service_type,
    consolidate_guide: isConsolidated
      ? data.consolidate_guide.map((guide) => ({
          client_id: Number(data.cliente),
          guide_number: guide.guide_number,
          pieces: guide.pieces,
          weight: guide.weight,
        }))
      : [],
    truck: data.truck,
    client: data.cliente.toString(),
    type_operation: data.type_operation,
    origen: data.origen,
    destination: data.destination,
    pickup: model.getEventDate("pick_up"),
    departure: model.getEventDate("departure"),
    clear_mex: model.getEventDate("clear_mex"),
    mex_inspection: model.getEventDate("mex_inspeccion"),
    mex_seal: model.getNotes("mex_inspeccion"),
    usa_inspection: model.getEventDate("usa_inspeccion"),
    usa_seal: model.getNotes("usa_inspeccion"),
    clear_usa: model.getNotes("clear_usa"),
    deliver: model.getEventDate("deliver"),
    deliver_notes: model.getNotes("deliver"),
  };
};

export const ShipmentRow = forwardRef<HTMLTableRowElement, ShipmentRowProps>(
  ({ shipment: rawShipment, onRowDoubleClick }, ref) => {
    const shipmentModel = new ShipmentModel(rawShipment);
    const row = displayDataShipment(shipmentModel);

    return (
      <Table.Tr
        ref={ref}
        onDoubleClick={() => onRowDoubleClick(rawShipment)}
        style={{ cursor: "pointer" }}>
        <Table.Td>{row.tracking_Trailer}</Table.Td>
        <Table.Td>{row.costumer_tracking}</Table.Td>
        <Table.Td>{row.truck}</Table.Td>
        <Table.Td>{row.client}</Table.Td>
        <Table.Td>{row.trailer}</Table.Td>
        <Table.Td>{row.assignation}</Table.Td>
        <Table.Td>{row.type_operation}</Table.Td>
        <Table.Td>{row.origen}</Table.Td>
        <Table.Td>{row.destination}</Table.Td>
        <Table.Td c="dimmed">{row.pickup}</Table.Td>
        <Table.Td c="dimmed">{row.departure}</Table.Td>
        <Table.Td c="dimmed">{row.mex_inspection}</Table.Td>

        <Table.Td c="dimmed">{row.mex_seal}</Table.Td>
        <Table.Td c="dimmed">{row.clear_mex}</Table.Td>

        <Table.Td c="dimmed">{row.usa_inspection}</Table.Td>
        <Table.Td c="dimmed">{row.usa_seal}</Table.Td>

        <Table.Td c="dimmed">{row.clear_mex}</Table.Td>
        <Table.Td c="dimmed">{row.deliver}</Table.Td>

        <Table.Td c="dimmed">{row.deliver_notes}</Table.Td>
      </Table.Tr>
    );
  },
);
