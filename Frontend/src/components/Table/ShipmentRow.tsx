import { Center, Loader, Table, Text } from '@mantine/core';
import { Shipment } from '@/types/Shipment';

interface ShipmentRowProps {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  onRowDoubleClick: (element: Shipment) => void;
}

export default function ShipmentRow({ shipments, loading, error, onRowDoubleClick }: ShipmentRowProps) {
  
  const getEventDate = (trip: Shipment, categoryKey: string) => {
    const targetEvent = trip.events?.find(e => e.category === categoryKey);
    if (!targetEvent || !targetEvent.dateTime) return '--';
    return new Date(targetEvent.dateTime).toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
    }).replace(',', '');
  };

  const getNotes = (element: Shipment, categoryKey: string) => {
    const targetEvent = element.events?.find(e => e.category === categoryKey);
    if (!targetEvent || !targetEvent.notes) return '--';
    return targetEvent.notes;
  };

  if (loading) return <Table.Tr><Table.Td colSpan={16}><Center py="xl"><Loader size="sm" /></Center></Table.Td></Table.Tr>;
  if (error) return <Table.Tr><Table.Td colSpan={16}><Center py="xl"><Text c="red" fz="sm">{error}</Text></Center></Table.Td></Table.Tr>;

  return (
    
      shipments.map((shipment) => (
        <Table.Tr 
          key={shipment.id}
          onDoubleClick={() => onRowDoubleClick(shipment)} 
          style={{ cursor: 'pointer' }}
        >
          <Table.Td>{shipment.trcking_Number}</Table.Td>
          <Table.Td>{shipment.trailer}</Table.Td>
          <Table.Td>{shipment.truck}</Table.Td>
          <Table.Td>{shipment.type_operation}</Table.Td>
          <Table.Td>{shipment.orgien}</Table.Td>
          <Table.Td>{shipment.destino}</Table.Td>

          <Table.Td c='dimmed'>{getEventDate(shipment, 'pick_up')}</Table.Td>
          <Table.Td c='dimmed'>{getEventDate(shipment, 'departure')}</Table.Td>
          <Table.Td c='dimmed'>{getEventDate(shipment, 'clear_mex')}</Table.Td>
          <Table.Td c='dimmed'>{getEventDate(shipment, 'mex_inspeccion')}</Table.Td>
          <Table.Td c='dimmed'>{getNotes(shipment, 'mex_inspeccion')}</Table.Td>
          <Table.Td c='dimmed'>{getEventDate(shipment, 'usa_inspeccion')}</Table.Td>
          <Table.Td c='dimmed'>{getNotes(shipment, 'usa_inspeccion')}</Table.Td>
          <Table.Td c='dimmed'>{getEventDate(shipment, 'clear_usa')}</Table.Td>
          <Table.Td c='dimmed'>{getEventDate(shipment, 'deliver')}</Table.Td>
          <Table.Td c='dimmed'>{getNotes(shipment, 'deliver')}</Table.Td>
        </Table.Tr>
      ))
  );
}