import { useState } from 'react';
import { Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Shipment } from '@/features/shipments/types/Shipment';
import { ShipmentRow } from './ShipmentRow';
import { shipmentService } from '@/features/shipments/service/shipmentService';
import { useTranslation } from 'react-i18next';
import { EmbarqueModal } from './EmbarqueModalProps';
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows';

interface ShipmentTableProps {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  onUpdateShipment: (id: number, data: Shipment) => void;
  onLastElement?: (node: HTMLTableRowElement | null) => void;
}

export default function ShipmentTable({ shipments, loading, error, onUpdateShipment, onLastElement }: ShipmentTableProps) {
  const { t, i18n } = useTranslation()
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
      await shipmentService.update(updatedValues.id, updatedValues);

      onUpdateShipment(updatedValues.id, updatedValues);

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
              <Table.Th w={100}>{t('shipment.table.trackingNumber')}</Table.Th>
              <Table.Th w={130} >{t('shipment.table.customer_tracking')}</Table.Th>
              <Table.Th w={120} >{t('shipment.table.trailer')}</Table.Th>
              <Table.Th w={100} >Tractosr</Table.Th>
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
            {loading && shipments.length === 0 ? (
              <TableSkeletonRows rows={5} columns={15} />
            ) : (
              shipments.map((shipment, index) => {
                const isLastElement = shipments.length === index + 1;
                return (
                  <ShipmentRow
                    ref={isLastElement ? onLastElement : null}
                    key={shipment.id}
                    shipment={shipment}
                    onRowDoubleClick={handleRowDoubleClick}
                  />
                );
              })
            )}
            {loading && shipments.length > 0 && <TableSkeletonRows rows={3} columns={15} />}
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