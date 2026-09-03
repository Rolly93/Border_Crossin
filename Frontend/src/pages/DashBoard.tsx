// pages/Home.page.tsx
import Headers from '@/components/Header/Header';
import { Container } from '@mantine/core';

import { useShipments } from '@/features/shipments/hooks/useShipments';
import { Shipment } from '@/types/Shipment';
import { useCallback, useMemo, useRef, useState } from 'react';
import ShipmentTable from '@/features/shipments/components/ShipmentTable';

export function DashBoard() {

  const { shipments, loading, error, addShipment, updateShipment, hasMore, fetchNextPage } = useShipments();
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');
  const observer = useRef<IntersectionObserver | null>(null)

  const filterShipments = useMemo(() => {
    const query = search.toLocaleLowerCase().trim();
    if (!query) return shipments;

    return (shipments.filter((shipment) => {
      return (
        shipment.status?.toString().toLocaleLowerCase().includes(query) ||
        shipment.cliente?.toString().toLocaleLowerCase().includes(query) ||
        shipment.trailer?.toString().toLocaleLowerCase().includes(query) ||
        shipment.truck?.toString().toLocaleLowerCase().includes(query)
      );
    }));
  }, [search, shipments])

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading || search.trim().length > 0) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNextPage();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, hasMore, fetchNextPage, search]
  );


  const handleCreateSubmit = async (newValues: Shipment) => {
    addShipment(newValues)
  };

  return (
    <Container size="responsive">
      <Headers
        onAddShipment={handleCreateSubmit}
        isCreating={isCreating}
        searchValue={search}
        onSearchChange={setSearch} />

      <ShipmentTable
        shipments={filterShipments}
        loading={loading}
        error={error}
        onUpdateShipment={updateShipment}
        onLastElement={lastElementRef}
      />
    </Container>
  );
}