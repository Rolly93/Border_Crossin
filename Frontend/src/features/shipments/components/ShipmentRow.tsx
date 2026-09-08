import { Table } from '@mantine/core';
import { Shipment } from '@/features/shipments/types/Shipment';
import { ShipmentModel } from '../domain/shipmentModel';
import { forwardRef } from 'react';

interface ShipmentRowProps {
  shipment: Shipment;
  onRowDoubleClick: (element: Shipment) => void;
}

function getDate(date: Date): string {

  if (!date) return '--';

  return new Date(date)
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

export const ShipmentRow = forwardRef<HTMLTableRowElement, ShipmentRowProps>(
  ({ shipment: rawShipment, onRowDoubleClick }, ref) => {


    const shipment = new ShipmentModel(rawShipment);
    const create = getDate(shipment.data.create!)
    return (
      <Table.Tr
        ref={ref}
        onDoubleClick={() => onRowDoubleClick(rawShipment)}
        style={{ cursor: 'pointer' }}
      >
        <Table.Td>{shipment.data.customer_tracking}</Table.Td>
        <Table.Td>{shipment.data.tracking_number}</Table.Td>
        <Table.Td>{shipment.data.trailer}</Table.Td>
        <Table.Td>{shipment.data.truck}</Table.Td>
        <Table.Td>{shipment.data.cliente}</Table.Td>
        <Table.Td>{create}</Table.Td>
        <Table.Td>{shipment.data.type_operation}</Table.Td>
        <Table.Td>{shipment.data.origen}</Table.Td>
        <Table.Td>{shipment.data.destino}</Table.Td>
        <Table.Td c="dimmed">{shipment.getEventDate('pick_up')}</Table.Td>
        <Table.Td c="dimmed">{shipment.getEventDate('departure')}</Table.Td>
        <Table.Td c="dimmed">{shipment.getEventDate('clear_mex')}</Table.Td>
        <Table.Td c="dimmed">{shipment.getEventDate('mex_inspeccion')}</Table.Td>
        <Table.Td c="dimmed">{shipment.getNotes('mex_inspeccion')}</Table.Td>
        <Table.Td c="dimmed">{shipment.getEventDate('usa_inspeccion')}</Table.Td>
        <Table.Td c="dimmed">{shipment.getNotes('usa_inspeccion')}</Table.Td>
        <Table.Td c="dimmed">{shipment.getEventDate('clear_usa')}</Table.Td>
        <Table.Td c="dimmed">{shipment.getEventDate('deliver')}</Table.Td>
        <Table.Td c="dimmed">{shipment.getNotes('deliver')}</Table.Td>
      </Table.Tr>
    );
  }
);