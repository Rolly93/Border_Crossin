import { Center, Loader, Table, Text } from '@mantine/core';
import { Shipment} from '@/types/Shipment';
import { ShipmentModel } from '../utils/domain/shipmentModel';
interface ShipmentRowProps {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  onRowDoubleClick: (element: Shipment) => void;
}

export default function ShipmentRow({ shipments, loading, error, onRowDoubleClick }: ShipmentRowProps) {


  if (loading) return <Table.Tr><Table.Td colSpan={16}><Center py="xl"><Loader size="sm" /></Center></Table.Td></Table.Tr>;
  if (error) return <Table.Tr><Table.Td colSpan={16}><Center py="xl"><Text c="red" fz="sm">{error}</Text></Center></Table.Td></Table.Tr>;

  return (
    
      shipments.map((rawShipment) => {
        const shipment = new ShipmentModel(rawShipment);
      return(
        <Table.Tr 
          key={shipment.data.id}
          onDoubleClick={() => onRowDoubleClick(rawShipment)} 
          style={{ cursor: 'pointer' }}
        >
          <Table.Td>{shipment.data.costumer_tracking}</Table.Td>
          <Table.Td>{shipment.data.trcking_Number}</Table.Td>
          <Table.Td>{shipment.data.trailer}</Table.Td>
          <Table.Td>{shipment.data.truck}</Table.Td>
          <Table.Td>{shipment.data.cliente}</Table.Td>
          <Table.Td>{shipment.data.type_operation}</Table.Td>
          <Table.Td>{shipment.data.orgien}</Table.Td>
          <Table.Td>{shipment.data.destino}</Table.Td>
          <Table.Td c='dimmed'> {shipment.getEventDate('pick_up')}</Table.Td>
          <Table.Td c='dimmed'> {shipment.getEventDate('departure')}</Table.Td>
          <Table.Td c='dimmed'> {shipment.getEventDate('clear_mex')}</Table.Td>
          <Table.Td c='dimmed'> {shipment.getEventDate('mex_inspeccion')}</Table.Td>
          <Table.Td c='dimmed'> {shipment.getNotes('mex_inspeccion')}</Table.Td>
          <Table.Td c='dimmed'> {shipment.getEventDate('usa_inspeccion')}</Table.Td>
          <Table.Td c='dimmed'> {shipment.getNotes('usa_inspeccion')}</Table.Td>
          <Table.Td c='dimmed'> {shipment.getEventDate('clear_usa')}</Table.Td>
          <Table.Td c='dimmed'> {shipment.getEventDate('deliver')}</Table.Td>
          <Table.Td c='dimmed'> {shipment.getNotes('deliver')}</Table.Td>
        </Table.Tr>
      )  
      })
  );
}