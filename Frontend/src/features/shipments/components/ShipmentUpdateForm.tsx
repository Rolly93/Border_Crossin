/** @format */

import { useForm } from "@mantine/form";
import { SimpleGrid, Group, Stack, Text, Divider, Box } from "@mantine/core";
import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { setupShipmentWatchers } from "../validation/ShipmentFormRules";
import EditableTextInput from "../../../components/Input/EditableTextInput";

import { ShipmentValidator } from "../validation/ShipmentValidator";
import { EXPECTED_CATEGORIES, ShipmentModel } from "../domain/shipmentModel";
import { useFormNotifications } from "@/features/notfications/hooks/useNotifications";

import { useTranslation } from "react-i18next";

import { notify } from "../../../components/utils/notifications";
import { AtomButton } from "@/components/atoms/AtomButton";
import { TShipmentResponse } from "../hooks/useShipments";
import { useMemo, useState } from "react";
import { EventFieldConfig } from "../types/Shipment";
import { TrailerFieldsSection } from "./sections/TrailerFieldsSection";
import { ConsolidatedGuidesSection } from "./sections/ConsolidatedGuidesSection";
import EditableDateTimePicker from "@/components/Input/EditableDateTimePicker";

export const EVENT_FIELDS: EventFieldConfig[] = [
  { key: "pick_up" },
  { key: "departure" },
  { key: "delay", showNotes: true, maxNotesLength: 50 },
  { key: "mex_inspeccion", showNotes: true, maxNotesLength: 25 },
  { key: "clear_mex" },
  { key: "usa_inspeccion", showNotes: true, maxNotesLength: 25 },
  { key: "clear_usa" },
  { key: "safety_yard", showNotes: true, maxNotesLength: 25 },
  { key: "deliver", showNotes: true, maxNotesLength: 25 },
];

export default function ShipmentUpdateForm({
  onSubmit,
  initialShipment,
}: {
  onSubmit: (values: TShipmentResponse) => void;
  initialShipment: TShipmentResponse;
}) {
  const { t } = useTranslation();
  const shipmentModel = useMemo(
    () => new ShipmentModel(initialShipment, EXPECTED_CATEGORIES),
    [initialShipment],
  );
  const form = useForm<TShipmentResponse>({
    mode: "uncontrolled",
    validateInputOnChange: true,
    initialValues: shipmentModel.data,
    validate: (values) => {
      const validator = new ShipmentValidator(values);
      const eventErrors = validator.validateEventChronology() ?? {};
      return {
        customer_tracking: validator.validateCustomerTracking(),
        tracking_number: validator.validateTrackingNumber(),
        truck: validator.validateTruck(),
        origen: validator.validateOrigin(),
        destination: validator.validateDestination(),
        trailer: validator.validateTrailer(),
        type_operation: validator.validateTypeOperation(),
        ...eventErrors,
      };
    },
  });

  const values = form.getValues();
  const isConsolidated = values.service_type === "consolidated";
  const guides = (values as any).consolidate_guide ?? [];
  setupShipmentWatchers(form);

  useFormNotifications({
    errors: form.errors,
    prefix: "events.",
    title: "Error de Validacion en Evento",
  });

  const handeSubmit = (values: TShipmentResponse) => {
    if (!form.isDirty()) {
      notify.warning(
        "No has realizado ninguna modificación en los datos o fechas.",
        "Sin Cambios",
      );
      return;
    }
    if (!form.isDirty("events")) {
      notify.warning(
        "No has realizado ninguna modificación en los las fechas",
        "Sin Cambios",
      );
      return;
    }
    onSubmit(values);
  };

  return (
    <Box p="xs">
      <form onSubmit={form.onSubmit((values) => handeSubmit(values))}>
        <Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 2 }} spacing="xl">
            <EditableTextInput
              label={t("shipment.labels.trackingNumber")}
              {...form.getInputProps("tracking_number")}
            />
            <EditableTextInput
              label={t("shipment.labels.customer_tracking")}
              {...form.getInputProps("customer_tracking")}
            />
            <EditableTextInput
              label={t("shipment.labels.cliente")}
              {...form.getInputProps("cliente")}
            />
            <EditableTextInput
              label={t("shipment.labels.truck")}
              {...form.getInputProps("truck")}
            />
            <EditableTextInput
              label={t("shipment.labels.service_type")}
              {...form.getInputProps("service_type")}
            />
            <EditableTextInput
              label={t("shipment.labels.origen")}
              {...form.getInputProps("origen")}
            />
            <EditableTextInput
              label={t("shipment.labels.destination")}
              {...form.getInputProps("destination")}
            />

            {/*Selector de tipo de servicio */}

            {!isConsolidated ? (
              <TrailerFieldsSection form={form} disabled />
            ) : null}

            {isConsolidated && guides.length > 0 && (
              <ConsolidatedGuidesSection form={form} disabled={false} />
            )}
          </SimpleGrid>

          <Divider my="sm" />

          <Text fw={700} size="lg">
            Eventos de Logística / Transfer
          </Text>

          <SimpleGrid cols={{ base: 2, sm: 2, md: 3 }} spacing="lg" maw={900}>
            {EVENT_FIELDS.map((field) => {
              const events = form.values.events ?? [];
              const eventIndex = events.findIndex(
                (e) => e.category === field.key,
              );
              if (eventIndex === -1) {
                return null;
              }
              const hasDateTime = Boolean(events[eventIndex]?.dateTime);

              return (
                <Stack key={field.key}>
                  <EditableDateTimePicker
                    label={t(`shipment.labels.${field.key}`)}
                    timePickerProps={{
                      withDropdown: true,
                      popoverProps: { withinPortal: false },
                      format: "24h",
                    }}
                    placeholder={t("shipment.labels.dateTime")}
                    clearable
                    lockWhenFilled={!hasDateTime}
                    {...form.getInputProps(`events.${eventIndex}.dateTime`)}
                  />
                  {field.showNotes && (
                    <EditableTextInput
                      placeholder={t("shipment.labels.inspectionNote")}
                      size="xs"
                      maxLength={field.maxNotesLength || 50}
                      lockWhenFilled={!hasDateTime}
                      {...form.getInputProps(`events.${eventIndex}.notes`)}
                    />
                  )}
                </Stack>
              );
            })}
          </SimpleGrid>
          <Group justify="flex-end" mt="xl">
            <AtomButton type="submit" color="dark">
              GUARDAR
            </AtomButton>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
