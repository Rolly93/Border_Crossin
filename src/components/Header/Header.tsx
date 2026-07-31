import { Group, Input, Modal, Button, LoadingOverlay, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ShipmentForm } from "../Form/ShipmentForm";

interface HeadersProps {
  onAddShipment: (data: any) => Promise<void>;
  isCreating: boolean;

  searchValue:string;
  onSearchChange:(value:string) =>void;
}
export default function Headers({ onAddShipment, isCreating ,searchValue , onSearchChange }: HeadersProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const handleFormSubmit = async (data: any) => {
    await onAddShipment(data);
    close(); 
  };

  return (
      <Group justify={"space-between"} gap={"xl"}>
        <Input placeholder="Search shipments..."
        value={searchValue}
        onChange={(event)=>onSearchChange(event.currentTarget.value)} />
        
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
  );
}