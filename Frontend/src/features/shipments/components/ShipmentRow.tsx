/** @format */

import { Table } from "@mantine/core";
import { ShipmentModel } from "../domain/shipmentModel";
import { forwardRef } from "react";
import { TShipmentResponse } from "../hooks/useShipments";

interface ShipmentRowProps {
  shipment: TShipmentResponse;
  onRowDoubleClick: (element: TShipmentResponse) => void;
}

interface IShipmentData {
  costumer_tracking: string;
  tracking_Trailer: string;
  trailerOrGuide: string;
  truck: string;
  client: string;
  type_operation: "northbound" | "southbound";
  assignation: string;
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
  const trailerOrGuide =
    data.service_type === "consolidated"
      ? (data.consolidate_guide?.[0]?.guide_number ?? "--")
      : data.trailer_number || "--";

  return {
    tracking_Trailer: data.tracking_number,
    costumer_tracking: data.customer_tracking,
    assignation: data.assignation || "--",
    trailerOrGuide,
    truck: data.truck,
    // El backend ya envía el nombre del cliente como texto.
    client: data.cliente || "--",
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
    clear_usa: model.getEventDate("clear_usa"),
    deliver: model.getEventDate("deliver"),
    deliver_notes: model.getNotes("deliver"),
  };
};

export const ShipmentRow = forwardRef<HTMLTableRowElement, ShipmentRowProps>(
  ({ shipment: rawShipment, onRowDoubleClick }, ref) => {
    const row = displayDataShipment(new ShipmentModel(rawShipment));

    return (
      <Table.Tr
        ref={ref}
        onDoubleClick={() => onRowDoubleClick(rawShipment)}
        style={{ cursor: "pointer" }}>
        <Table.Td>{row.tracking_Trailer}</Table.Td>
        <Table.Td>{row.costumer_tracking}</Table.Td>
        <Table.Td>{row.trailerOrGuide}</Table.Td>
        <Table.Td>{row.client}</Table.Td>
        <Table.Td>{row.truck}</Table.Td>
        <Table.Td>{row.assignation}</Table.Td>
        <Table.Td>{row.type_operation}</Table.Td>
        <Table.Td>{row.origen}</Table.Td>
        <Table.Td>{row.destination}</Table.Td>
        <Table.Td c="dimmed">{row.pickup}</Table.Td>
        <Table.Td c="dimmed">{row.departure}</Table.Td>
        <Table.Td c="dimmed">{row.clear_mex}</Table.Td>
        <Table.Td c="dimmed">{row.mex_inspection}</Table.Td>
        <Table.Td c="dimmed">{row.mex_seal}</Table.Td>
        <Table.Td c="dimmed">{row.clear_usa}</Table.Td>
        <Table.Td c="dimmed">{row.usa_inspection}</Table.Td>
        <Table.Td c="dimmed">{row.usa_seal}</Table.Td>
        <Table.Td c="dimmed">{row.deliver}</Table.Td>
        <Table.Td c="dimmed">{row.deliver_notes}</Table.Td>
      </Table.Tr>
    );
  },
);
