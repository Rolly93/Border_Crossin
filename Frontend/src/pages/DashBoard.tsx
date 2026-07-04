// pages/Home.page.tsx
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import ShipmentTable from '../components/Table/ShipmentTable';
import Headers from '@/components/Header/Header';
import { Container } from '@mantine/core';


import { useShipments } from '@/hooks/useShipments';
import { shipmentService } from '@/service/shipmentService';
import { Shipment } from '@/types/Shipment';
import { useState } from 'react';

export function DashBoard() {

// 🌟 El hook vive aquí en el padre de ambos
  const { shipments, loading, error, updateLocalShipment, addLocalShipment } = useShipments();
  const [isCreating, setIsCreating] = useState(false);

  // Lógica para GUARDAR un nuevo embarque creado desde el Header
  const handleCreateSubmit = async (newValues: Shipment) => {
    try {
      setIsCreating(true);
      
 
      const shipmentToSave = await shipmentService.insert({ ...newValues }) 
      await shipmentService.post(shipmentToSave.id, shipmentToSave);
      
      addLocalShipment(shipmentToSave);
      
    } catch (err) {
      console.error("Error creating shipment:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Container size="responsive">
<Headers onAddShipment={handleCreateSubmit} isCreating={isCreating} />     
       <ShipmentTable 
          shipments={shipments} 
          loading={loading} 
          error={error} 
          updateLocalShipment={updateLocalShipment} 
        />
      <ColorSchemeToggle />
    </Container>
  );
}