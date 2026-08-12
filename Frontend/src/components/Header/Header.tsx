import { Group, Input, Modal, Button, LoadingOverlay, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ShipmentForm } from "../Form/ShipmentForm";
import { useTranslation } from "react-i18next";


interface HeadersProps {
  onAddShipment: (data: any) => Promise<void>;
  isCreating: boolean;

  searchValue:string;
  onSearchChange:(value:string) =>void;
}
export default function Headers({ onAddShipment, isCreating ,searchValue , onSearchChange }: HeadersProps) {
  const {t,i18n} = useTranslation()
  const [opened, { open, close }] = useDisclosure(false);

  const handleFormSubmit = async (data: any) => {
    await onAddShipment(data);
    close();
  };

  return (
      <Group justify={"space-between"} gap={"xl"}>
        <Input placeholder={t('common.search.placeholders.shipment')}
        value={searchValue}
        onChange={(event)=>onSearchChange(event.currentTarget.value)} />

        <Button variant="default" onClick={open}>
          {t('common.buttons.newShipment')}
        </Button>

        <Modal
          opened={opened}
          onClose={close}
          title={t('modal.titles.newShipment')}
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