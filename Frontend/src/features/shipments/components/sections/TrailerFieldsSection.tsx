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
  editable = false,
  disabled = false,
}: TrailerFieldsSectionProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="xs">
      <Group grow align="flex-start">
        {editable ? (
          <>
            <EditableTextInput
              label={t("shipment.labels.trailer")}
              required
              placeholder={t("shipment.placeholders.trailer")}
              disabled={disabled}
              {...form.getInputProps("trailer_number")}
            />
            <EditableTextInput
              label="Sello"
              required
              placeholder="Sello"
              disabled={disabled}
              {...form.getInputProps("seal")}
            />
            <EditableTextInput
              label="Placas"
              required
              placeholder="Placa de Caja"
              disabled={disabled}
              {...form.getInputProps("plates")}
            />
            <EditableTextInput
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
              label={t("shipment.labels.trailer") + " sdfe"}
              {...form.getInputProps("trailer_number")}
            />
            {/*<EditableTextInput label="Sello" formProps={form.getInputProps("seal")}/>*/}
            {/*<EditableTextInput label="Placas" formProps={form.getInputProps("plates")}/>*/}
            {/*<EditableTextInput label="Estado" formProps={form.getInputProps("state")}/>*/}
          </>
        )}
      </Group>
    </Stack>
  );
}