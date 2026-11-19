/** @format */

import EditableTextInput from "@/components/Input/EditableTextInput";
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";

interface ConsolidatedGuidesSectionProps {
  form: UseFormReturnType<any>;
  editable?: boolean;
  disabled?: boolean;
}

export function ConsolidatedGuidesSection({
  form,
  editable = true,
  disabled = false,
}: ConsolidatedGuidesSectionProps) {
  const values = form.getValues();
  const guides = values.consolidate_guide ?? [];

  const totalPieces = guides.reduce(
    (acc: number, g: any) => acc + (Number(g?.pieces) || 0),
    0,
  );
  const totalWeight = guides.reduce(
    (acc: number, g: any) => acc + (Number(g?.weight) || 0),
    0,
  );

  const handleAddGuide = () => {
    form.insertListItem("consolidate_guide", {
      client_id: values.cliente ?? null,
      guide_number: "",
      pieces: 1,
      weight: 0,
    });
  };

  return (
    <Stack gap="xs">
      <Divider label="Guías del Consolidado" labelPosition="center" my="xs" />

      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Números de Guía / Paquetes ({guides.length}) — {totalPieces} pzs /{" "}
          {totalWeight.toFixed(2)} kg
        </Text>

        {editable && !disabled && (
          <Button
            type="button"
            variant="default"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={handleAddGuide}
          >
            Agregar Guía
          </Button>
        )}
      </Group>

      <Group grow align="center" pr={editable ? 36 : 0}>
        <Text size="xs" fw={500} c="dimmed">
          Número de Guía
        </Text>
        <Text size="xs" fw={500} c="dimmed">
          Piezas
        </Text>
        <Text size="xs" fw={500} c="dimmed">
          Peso (kg)
        </Text>
      </Group>

      <Stack gap="xs">
        {guides.map((guide: any, index: number) => (
          <Group key={guide?.id ?? index} align="center" grow>
            {editable ? (
              <>
                <TextInput
                  placeholder="Número de Guía"
                  required
                  disabled={disabled}
                  {...form.getInputProps(`consolidate_guide.${index}.guide_number`)}
                />
                <NumberInput
                  placeholder="Piezas"
                  min={1}
                  disabled={disabled}
                  {...form.getInputProps(`consolidate_guide.${index}.pieces`)}
                />
                <NumberInput
                  placeholder="Peso (kg)"
                  min={0}
                  decimalScale={2}
                  disabled={disabled}
                  {...form.getInputProps(`consolidate_guide.${index}.weight`)}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  style={{ flexGrow: 0 }}
                  onClick={() => form.removeListItem("consolidate_guide", index)}
                  disabled={disabled || guides.length <= 1}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </>
            ) : (
              <>
                <EditableTextInput
                  label=""
                  disabled={disabled}
                  formProps={form.getInputProps(
                    `consolidate_guide.${index}.guide_number`,
                  )}
                />
                <EditableTextInput
                  label=""
                  disabled={disabled}
                  formProps={form.getInputProps(
                    `consolidate_guide.${index}.pieces`,
                  )}
                />
                <EditableTextInput
                  label=""
                  disabled={disabled}
                  formProps={form.getInputProps(
                    `consolidate_guide.${index}.weight`,
                  )}
                />
              </>
            )}
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}