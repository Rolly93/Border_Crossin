import { useState } from 'react';
import { EmbarqueModal } from '../EmbarqueModalProps'; // Asegúrate que tu ruta esté bien
import { Table} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Shipment } from '@/types/Shipment';
import ShipmentRow from './ShipmentRow';
import { shipmentService } from '@/service/shipmentService';

interface ShipmentTableProps {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  updateLocalShipment: (id: number, data: Shipment) => void;
}

export default function ShipmentTable({ shipments, loading, error, updateLocalShipment }: ShipmentTableProps) {
const [opened, { open, close }] = useDisclosure(false);
  const [selectedElement, setSelectedElement] = useState<Shipment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleRowDoubleClick = (element: Shipment): void => {
    setSelectedElement(element);
    
    open();
  };


  const handleUpdateSubmit = async (updatedValues: Shipment) => {
    try {
      setIsSaving(true);
      await shipmentService.post(updatedValues.id, updatedValues);
      
      updateLocalShipment(updatedValues.id, updatedValues);
      
      close();
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setIsSaving(false);
    }
  };

  


  return (
    <>
    <Table.ScrollContainer minWidth={1400} maxHeight={500} >
      <Table 
      highlightOnHover
      horizontalSpacing={'md'}
      verticalSpacing={'sm'}
      layout='fixed' >
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={100}>Referencia</Table.Th>
            <Table.Th w={130} >No. Embarque</Table.Th>
            <Table.Th w={120} >Equipo</Table.Th>
            <Table.Th w={100} >Tractor</Table.Th>
            <Table.Th w={180} >Cliente</Table.Th>
            <Table.Th w={140} >Tipo Operacion</Table.Th>
            <Table.Th w={160} >Origen</Table.Th>
            <Table.Th w={160} >Destino</Table.Th>

            <Table.Th w={140}>Recoleccion</Table.Th>
            <Table.Th w={140}>Salida de Patio</Table.Th>
            <Table.Th w={140}>Verde Mexicano</Table.Th>

            <Table.Th w={140}>Rojo Mexicano</Table.Th>
            <Table.Th w={140}>Notas</Table.Th>
            
            <Table.Th w={140}>Verde Americano</Table.Th>
            
            <Table.Th w={140}>Rojo Americano</Table.Th>
            <Table.Th w={140}>Notas Americano</Table.Th>
            <Table.Th w={140}>Entrega</Table.Th>
            <Table.Th w={140}>Recibe</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <ShipmentRow shipments={shipments} 
              loading={loading} 
              error={error} 
              onRowDoubleClick={handleRowDoubleClick} />
           </Table.Tbody>
      </Table>

    </Table.ScrollContainer>

<EmbarqueModal 
  opened={opened} 
  onClose={close} 
  selectedElement={selectedElement} 
  onSubmit={handleUpdateSubmit}
  loading={isSaving}
/>
    </>
  );
}