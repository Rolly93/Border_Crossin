/** @format */

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconListDetails, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

interface ConsolidatedGuideItem {
  id?: string | number;
  client_id?: number | string | null;
  guide_number: string;
  pieces: number;
  weight: number;
}

interface ConsolidatedGuidesSectionProps {
  form: UseFormReturnType<any>;
  disabled?: boolean;
}

export function ConsolidatedGuidesSection({
  form,
  disabled = false,
}: ConsolidatedGuidesSectionProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [draftGuides, setDraftGuides] = useState<ConsolidatedGuideItem[]>([]);

  const values = form.getValues();
  const guides: ConsolidatedGuideItem[] = values.consolidate_guide ?? [];

  const totalPieces = guides.reduce(
    (acc, g) => acc + (Number(g?.pieces) || 0),
    0,
  );
  const totalWeight = guides.reduce(
    (acc, g) => acc + (Number(g?.weight) || 0),
    0,
  );

  // Al abrir el modal, copiamos las guías actuales al estado temporal
  const handleOpenModal = () => {
    const initialDraft =
      guides.length > 0
        ? guides.map((g) => ({ ...g }))
        : [
            {
              client_id: values.cliente ?? null,
              guide_number: "",
              pieces: 1,
              weight: 0,
            },
          ];

    setDraftGuides(initialDraft);
    open();
  };

  const handleAddDraftGuide = () => {
    setDraftGuides((prev) => [
      ...prev,
      {
        client_id: values.cliente ?? null,
        guide_number: "",
        pieces: 1,
        weight: 0,
      },
    ]);
  };

  const handleUpdateDraftGuide = (
    index: number,
    field: keyof ConsolidatedGuideItem,
    value: string | number,
  ) => {
    setDraftGuides((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleRemoveDraftGuide = (index: number) => {
    setDraftGuides((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Volcar los cambios del modal al formulario principal
  const handleSaveModal = () => {
    form.setFieldValue("consolidate_guide", draftGuides);
    close();
  };

  const draftTotalPieces = draftGuides.reduce(
    (acc, g) => acc + (Number(g?.pieces) || 0),
    0,
  );
  const draftTotalWeight = draftGuides.reduce(
    (acc, g) => acc + (Number(g?.weight) || 0),
    0,
  );

  return (
    <Stack gap="xs" w="100%">
      <Divider label="Guías del Consolidado" labelPosition="center" my="xs" />

      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Badge variant="light" color="blue">
            {totalPieces} pzs • {totalWeight.toFixed(2)} kg Guías (
            {guides.length})
          </Badge>
        </Group>

        {!disabled && (
          <Button
            type="button"
            variant="light"
            size="xs"
            leftSection={
              guides.length > 0 ? (
                <IconListDetails size={14} />
              ) : (
                <IconPlus size={14} />
              )
            }
            onClick={handleOpenModal}>
            {guides.length > 0 ? "Gestionar / Agregar Guías" : "Agregar Guías"}
          </Button>
        )}
      </Group>

      {/* Tabla compacta con scroll en el formulario principal */}
      <ScrollArea.Autosize mah={200} type="auto" offsetScrollbars>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={50}>#</Table.Th>
              <Table.Th>Número de Guía</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {guides.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text size="xs" c="dimmed" ta="center" py="xs">
                    No hay guías registradas aún.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              guides.map((g, index) => (
                <Table.Tr key={g?.id ?? index}>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>{g?.guide_number || "—"}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea.Autosize>

      {/* Modal con formulario completo de captura */}
      <Modal
        opened={opened}
        onClose={close}
        title="Gestión de Guías del Consolidado"
        size="lg"
        centered>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Total: <strong>{draftGuides.length}</strong> guías •{" "}
              <strong>{draftTotalPieces}</strong> pzs •{" "}
              <strong>{draftTotalWeight.toFixed(2)}</strong> kg
            </Text>

            <Button
              type="button"
              variant="default"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={handleAddDraftGuide}>
              Agregar Guía
            </Button>
          </Group>

          <ScrollArea.Autosize mah={320} type="auto" offsetScrollbars>
            <Stack gap="sm" pr="xs">
              {draftGuides.map((guide, index) => (
                <Group
                  key={guide.id ?? index}
                  align="flex-end"
                  wrap="nowrap"
                  gap="sm">
                  <Box style={{ flex: 2 }}>
                    <TextInput
                      label={index === 0 ? "Número de Guía" : undefined}
                      placeholder="Ej. TNL-001"
                      required
                      value={guide.guide_number}
                      onChange={(e) =>
                        handleUpdateDraftGuide(
                          index,
                          "guide_number",
                          e.currentTarget.value,
                        )
                      }
                    />
                  </Box>

                  <Box w={110}>
                    <NumberInput
                      label={index === 0 ? "Piezas" : undefined}
                      placeholder="1"
                      min={1}
                      value={guide.pieces}
                      onChange={(val) =>
                        handleUpdateDraftGuide(
                          index,
                          "pieces",
                          Number(val) || 1,
                        )
                      }
                    />
                  </Box>

                  <Box w={130}>
                    <NumberInput
                      label={index === 0 ? "Peso (kg)" : undefined}
                      placeholder="0.00"
                      min={0}
                      decimalScale={2}
                      value={guide.weight}
                      onChange={(val) =>
                        handleUpdateDraftGuide(
                          index,
                          "weight",
                          Number(val) || 0,
                        )
                      }
                    />
                  </Box>

                  <ActionIcon
                    color="red"
                    variant="subtle"
                    mb={4}
                    onClick={() => handleRemoveDraftGuide(index)}
                    disabled={draftGuides.length <= 1}
                    title="Eliminar guía">
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </ScrollArea.Autosize>

          <Group justify="flex-end" mt="sm">
            <Button type="button" variant="default" onClick={close}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveModal}>
              Guardar Guías
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
