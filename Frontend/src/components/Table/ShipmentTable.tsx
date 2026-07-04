import { useState } from 'react';
import { EmbarqueModal } from '../EmbarqueModalProps'; // Asegúrate que tu ruta esté bien
import { Table, LoadingOverlay, Box } from '@mantine/core';
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
      <Table highlightOnHover >
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={100}>Referencia</Table.Th>
            <Table.Th>Equipo</Table.Th>
            <Table.Th>Tractor</Table.Th>
            <Table.Th>Tipo Operacion</Table.Th>
            <Table.Th>Origen</Table.Th>
            <Table.Th>Destino</Table.Th>

            <Table.Th w={150}>Recoleccion</Table.Th>
            <Table.Th>Salida de Patio</Table.Th>
            <Table.Th>Verde Mexicano</Table.Th>

            <Table.Th>Rojo Mexicano</Table.Th>
            <Table.Th>Notas</Table.Th>
            
            <Table.Th>Verde Americano</Table.Th>
            
            <Table.Th>Rojo Americano</Table.Th>
            <Table.Th>Notas Americano</Table.Th>
            <Table.Th>Entrega</Table.Th>
            <Table.Th>Recibe</Table.Th>
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