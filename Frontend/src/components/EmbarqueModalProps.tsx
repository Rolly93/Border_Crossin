import { Modal, TextInput, Button, LoadingOverlay, Box } from '@mantine/core';
import ShipmentUpdateForm from './Form/ShipmentUpdateForm';
import { Shipment } from '@/types/Shipment';

interface EmbarqueModalProps {
  opened: boolean;
  onClose: () => void;
  selectedElement: Shipment| null;
  onSubmit: (formData: Shipment) => Promise<void>
  loading: boolean;
}

export function EmbarqueModal({ opened, onClose, selectedElement, onSubmit, loading }: EmbarqueModalProps) {
  const SubmitShipment = async (formData: Shipment) => {
    await onSubmit(formData)
  }
  return (
    <Modal 
      opened={opened}
      onClose={onClose}
      title={selectedElement ? `Trailer ${selectedElement.trailer}` : "Form"}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      size='auto'
    >
      <Box style={{ position: 'relative', minHeight: 200 }}>
        {/* El loading ahora viene controlado desde el flujo del padre */}
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