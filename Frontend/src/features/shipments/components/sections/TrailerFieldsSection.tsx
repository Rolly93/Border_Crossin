/** @format */

import EditableTextInput from "@/components/Input/EditableTextInput";
import { Divider, Group, Stack, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

interface TrailerFieldsSectionProps {
  form: UseFormReturnType<any>;
  editable?: boolean;
  disabled?: boolean;
}

export function TrailerFieldsSection({
  form,
  editable = true,
  disabled = false,
}: TrailerFieldsSectionProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="xs">
      <Divider label="Servicio 53Ft" labelPosition="center" my="xs" />
      <Group grow align="flex-start">
        {editable ? (
          <>
            <TextInput
              label={t("shipment.labels.trailer")}
              required
              placeholder={t("shipment.placeholders.trailer")}
              disabled={disabled}
              {...form.getInputProps("trailer_number")}
            />
            <TextInput
              label="Sello"
              required
              placeholder="Sello"
              disabled={disabled}
              {...form.getInputProps("seal")}
            />
            <TextInput
              label="Placas"
              required
              placeholder="Placa de Caja"
              disabled={disabled}
              {...form.getInputProps("plates")}
            />
            <TextInput
              label="Estado"
              required
              placeholder="Ej. Mex, USA..."
              disabled={disabled}
              {...form.getInputProps("state")}
            />
          </>
        ) : (
          <>
            <EditableTextInput
              label={t("shipment.labels.trailer")}
              disabled={disabled}
              formProps={form.getInputProps("trailer_number")}
            />
            <EditableTextInput
              label="Sello"
              disabled={disabled}
              formProps={form.getInputProps("seal")}
            />
            <EditableTextInput
              label="Placas"
              disabled={disabled}
              formProps={form.getInputProps("plates")}
            />
            <EditableTextInput
              label="Estado"
              disabled={disabled}
              formProps={form.getInputProps("state")}
            />
          </>
        )}
      </Group>
    </Stack>
  );
}