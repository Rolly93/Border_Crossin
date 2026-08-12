import { Modal, LoadingOverlay, Box } from '@mantine/core';
import ShipmentUpdateForm from '../Form/ShipmentUpdateForm';
import { Shipment } from '@/types/Shipment';
import { useTranslation } from 'react-i18next';

interface EmbarqueModalProps {
  opened: boolean;
  onClose: () => void;
  selectedElement: Shipment| null;
  onSubmit: (formData: Shipment) => Promise<void>
  loading: boolean;
}

export function EmbarqueModal({ opened, onClose, selectedElement, onSubmit, loading }: EmbarqueModalProps) {
  const {t,i18n} = useTranslation()
  const SubmitShipment = async (formData: Shipment) => {
    await onSubmit(formData)
  }
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={selectedElement ? `${t('modal.titles.selectedTrailer')} ${selectedElement.trailer}` : "Form"}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      size='auto'
    >
      <Box style={{ position: 'relative', minHeight: 200 }}>
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

        {selectedElement && (
          <ShipmentUpdateForm
            initialShipment={selectedElement}
            onSubmit={(updatedValues) => {
              SubmitShipment(updatedValues);
            }}
            />

        )}
      </Box>
    </Modal>
  );
}