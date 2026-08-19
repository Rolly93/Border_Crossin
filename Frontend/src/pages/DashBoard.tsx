// pages/Home.page.tsx
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import ShipmentTable from '../components/Table/ShipmentTable';
import Headers from '@/components/Header/Header';
import { Container } from '@mantine/core';


import { useShipments } from '@/hooks/useShipments';
import { shipmentService } from '@/service/shipmentService';
import { Shipment } from '@/types/Shipment';
import { useMemo, useState } from 'react';

export function DashBoard() {

  const { shipments, loading, error, updateLocalShipment, addLocalShipment } = useShipments();
  const [isCreating, setIsCreating] = useState(false);
  const [search,setSerach] = useState('');

  const filterShipments = useMemo(()=>{
    const query = search.toLocaleLowerCase().trim();
    if (!query) return shipments;

    return( shipments.filter((shipment)=>{
      return(
        shipment.status?.toString().toLocaleLowerCase().includes(query)||
        shipment.cliente?.toString().toLocaleLowerCase().includes(query)||
        shipment.trailer?.toString().toLocaleLowerCase().includes(query)||
        shipment.truck?.toString().toLocaleLowerCase().includes(query)
);
    }));
  },[search,shipments])

  const handleCreateSubmit = async (newValues: Shipment) => {
    try {
      setIsCreating(true);
      
      const shipmentToSave = await shipmentService.insert({ ...newValues }) 
      await shipmentService.update(shipmentToSave.id, shipmentToSave);
      
      addLocalShipment(shipmentToSave);
      
    } catch (err) {
      console.error("Error creating shipment:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Container size="responsive">
    <Headers 
      onAddShipment={handleCreateSubmit} 
      isCreating={isCreating}
      searchValue={search}
      onSearchChange={setSerach} />     

       <ShipmentTable 
          shipments={filterShipments} 
          loading={loading} 
          error={error} 
          updateLocalShipment={updateLocalShipment} 
        />
    </Container>
  );
}