import { ShipmentForm } from "@/features/shipments/components/ShipmentForm";
import { TShipmentCreateFormValues } from "@/features/shipments/types/Shipment";
import { Group, Input, Modal, LoadingOverlay, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AtomButton } from "../atoms/AtomButton";

interface HeadersProps {
  onAddShipment: (data: TShipmentCreateFormValues) => Promise<void>;
  isCreating: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function Headers({ onAddShipment, isCreating, searchValue, onSearchChange }: HeadersProps) {
  const [opened, { open, close }] = useDisclosure(false);

  // Si onAddShipment lanza, el modal queda abierto y ShipmentForm muestra el error.
  const handleFormSubmit = async (data: TShipmentCreateFormValues) => {
    await onAddShipment(data);
    close();
  };

  return (
    <Group justify="space-between" gap="xl">
      <Input
        placeholder="Search shipments..."
        value={searchValue}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
      />

      <AtomButton variant="default" onClick={open}>
        Add Shipment
      </AtomButton>

      <Modal
        opened={opened}
        onClose={close}
        title="Add New Shipment"
        size="lg"
      >
        {/* Usamos pos="relative" prop de Mantine en lugar de un objeto style plano */}
        <Box pos="relative">
          <LoadingOverlay visible={isCreating} overlayProps={{ blur: 2 }} />

          <ShipmentForm onSubmit={handleFormSubmit} onCancel={close} opened={opened} />
        </Box>
      </Modal>
    </Group>
  );
}