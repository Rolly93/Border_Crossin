import { Group, Input, Modal, Button, LoadingOverlay, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ShipmentForm } from "../Form/ShipmentForm";

interface HeadersProps {
  onAddShipment: (data: any) => Promise<void>;
  isCreating: boolean;
}
export default function Headers({ onAddShipment, isCreating }: HeadersProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const handleFormSubmit = async (data: any) => {
    // 1. Ejecutamos la función centralizada que guardará el dato en el estado del Padre
    await onAddShipment(data);
    // 2. Cerramos el modal
    close(); 
  };

  return (
    <>
      <Group justify={"space-between"} gap={"xl"}>
        <Input placeholder="Search" />
        <Button variant="default" onClick={open}>
          Add Shipment
        </Button>

        <Modal 
          opened={opened} 
          onClose={close} 
          title="Add New Shipment" 
          size="lg"
        >
          <Box style={{ position: 'relative' }}>
            <LoadingOverlay visible={isCreating} overlayProps={{ blur: 2 }} />
            
            <ShipmentForm onSubmit={handleFormSubmit} onCancel={close} />
          </Box>
        </Modal>
      </Group>
    </>
  );
}