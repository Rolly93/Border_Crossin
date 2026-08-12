import { useState } from 'react';
import { EmbarqueModal } from '../Modal/EmbarqueModalProps'; // Asegúrate que tu ruta esté bien
import { Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Shipment } from '@/types/Shipment';
import ShipmentRow from './ShipmentRow';
import { shipmentService } from '@/service/shipmentService';
import { useTranslation } from 'react-i18next';

interface ShipmentTableProps {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  updateLocalShipment: (id: number, data: Shipment) => void;
}

export default function ShipmentTable({ shipments, loading, error, updateLocalShipment }: ShipmentTableProps) {
  const {t,i18n} =useTranslation()

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
      console.log(updatedValues)
      await shipmentService.update(updatedValues.id, updatedValues);

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
            <Table.Th w={100}>{t('shipment.table.trackinNumber')}</Table.Th>
            <Table.Th w={130} >{t('shipment.table.customer_tracking')}</Table.Th>
            <Table.Th w={120} >{t('shipment.table.trailer')}</Table.Th>
              <Table.Th w={100} >{t('shipment.table.truck')}</Table.Th>
              <Table.Th w={180} >{t('shipment.table.cliente')}</Table.Th>
              <Table.Th w={140} >{t('shipment.table.operation_type')}</Table.Th>
              <Table.Th w={160} >{t('shipment.table.origen')}</Table.Th>
              <Table.Th w={160} >{t('shipment.table.destination')}</Table.Th>

              <Table.Th w={140}>{t('shipment.table.pick_up')}</Table.Th>
              <Table.Th w={140}>{t('shipment.table.departure')}</Table.Th>
              <Table.Th w={140}>{t('shipment.table.clear_mex')}</Table.Th>

              <Table.Th w={140}>{t('shipment.table.mex_inspeccion')}</Table.Th>
              <Table.Th w={140}>{t('shipment.table.inspectionNote')}</Table.Th>

              <Table.Th w={140}>{t('shipment.table.clearUsaCostums')}</Table.Th>

              <Table.Th w={140}>{t('shipment.table.usa_inspeccion')}</Table.Th>
              <Table.Th w={140}>{t('shipment.table.inspectionNote')}</Table.Th>
              <Table.Th w={140}>{t('shipment.table.deliver')}</Table.Th>
              <Table.Th w={140}>{t('shipment.table.recive')}</Table.Th>
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