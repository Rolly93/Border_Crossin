/** @format */

import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  Title,
  Paper,
} from "@mantine/core";
import { ShipmentFormProps } from "@/features/shipments/types/ShipmentFormProps";
import { setupShipmentWatchers } from "../validation/ShipmentFormRules";
import { ShipmentValidator } from "../validation/ShipmentValidator";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import { ApiError } from "@/components/utils/errorMessage";
import { useOperators } from "@/features/employee/hook/useOperators";
import { useMemo } from "react";
import { ShipmentModel } from "../domain/shipmentModel";
import { TShipmentCreateFormValues } from "../types/Shipment";
import { useClientOptions } from "@/features/clients/hooks/useClientOptions";
import { TrailerFieldsSection } from "./sections/TrailerFieldsSection";
import { ConsolidatedGuidesSection } from "./sections/ConsolidatedGuidesSection";

export enum TypeOperation {
  NORTHBOUND = "northbound",
  SOUTHBOUND = "southbound",
}

export enum ServiceType {
  TRAILER = "trailer_53ft",
  CONSOLIDATED = "consolidated",
}

export function ShipmentForm({
  initialData,
  onSubmit,
  onCancel,
  opened,
}: ShipmentFormProps) {
  const {
    operators,
    loading: operatorsLoading,
    error: operatorsError,
  } = useOperators(opened);

  const initialFormValues = useMemo(
    () =>
      new ShipmentModel(initialData).toCreateFormValues(
        (initialData as any)?.consolidate_guide,
      ),
    [initialData],
  );
  const { t } = useTranslation();
  const form = useForm<TShipmentCreateFormValues>({
    mode: "controlled",
    validateInputOnChange: true,
    initialValues: initialFormValues,
    // Solo chequeos baratos; las reglas de tráiler/consolidado las valida el
    // backend y sus errores se muestran por campo en handleSubmit.
    validate: (values) => {
      const validator = new ShipmentValidator(values);
      return {
        tracking_number: validator.validateTrackingNumber(),
        truck: validator.validateTruck(),
        origen: validator.validateOrigin(),
        destination: validator.validateDestination(),
        type_operation: validator.validateTypeOperation(),
      };
    },
  });

  setupShipmentWatchers(form);
  const toggleUnit = operators.filter(
    (u) => u.typeUnit === form.values.service_type,
  );

  const isConsolidated = form.values.service_type === ServiceType.CONSOLIDATED;
  const { options, loading } = useClientOptions();

  const handleValidationError = (_errors: typeof form.errors) => {
    notifications.show({
      title: "Error de Datos",
      message:
        "Por favor revisa los campos marcados en rojo antes de continuar.",
      color: "red",
    });
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await onSubmit(values);
    } catch (err) {
      // 422: errores por campo (p. ej. "plates", "consolidate_guide.0.guide_number").
      const fieldErrors = err instanceof ApiError ? err.fieldErrors : {};
      const hasFieldErrors = Object.keys(fieldErrors).length > 0;
      if (hasFieldErrors) {
        form.setErrors(fieldErrors);
      }
      // 404/409/400 (unidad sin operador, embarque duplicado, referencia
      // inválida...) no traen campo: se muestran como notificación.
      notifications.show({
        title: "No se pudo registrar el embarque",
        message: hasFieldErrors
          ? "Revisa los campos marcados en rojo."
          : err instanceof Error
            ? err.message
            : "Ocurrió un error",
        color: "red",
      });
    }
  };
  return (
    <Paper p="md" withBorder>
      <form
        onSubmit={form.onSubmit(
          (values) => handleSubmit(values as any),
          handleValidationError,
        )}>
        <Stack gap="md">
          <Title order={3}>Shipment Information</Title>

          {/* Selector de Tipo de Servicio */}
          <Select
            label="Tipo de Servicio"
            required
            data={[
              { value: ServiceType.TRAILER, label: "Tráiler 53 ft (FTL)" },
              {
                value: ServiceType.CONSOLIDATED,
                label: "Consolidado (3.5t / Rabón)",
              },
            ]}
            {...form.getInputProps("service_type")}
            onChange={(value) => {
              const nextType = (value as ServiceType) ?? ServiceType.TRAILER;
              form.setFieldValue("service_type", nextType);

              if (nextType === ServiceType.CONSOLIDATED) {
                form.setValues({
                  trailer_number: "",
                  seal: "",
                  plates: "",
                  state: "",
                  consolidate_guide:
                    form.values.consolidate_guide?.length > 0
                      ? form.values.consolidate_guide
                      : [
                          {
                            id: 0,
                            client_id: form.values.cliente,
                            guide_number: "",
                            pieces: 1,
                            weight: 0,
                          },
                        ],
                });
              }
            }}
          />

          <Group grow>
            <TextInput
              label={t("shipment.labels.trackingNumber")}
              placeholder={t("shipment.placeholders.trackingNumber")}
              required
              {...form.getInputProps("tracking_number")}
            />
            <TextInput
              label={t("shipment.labels.customer_tracking")}
              required
              placeholder={t("shipment.placeholders.customer_tracking")}
              {...form.getInputProps("customer_tracking")}
            />
          </Group>

          <Group grow>
            <Select
              label={t("shipment.labels.cliente")}
              placeholder={t("shipment.placeholders.cliente")}
              data={options.map((client) => ({
                value: String(client.id),
                label: client.name,
              }))}
              autoSelectOnBlur
              searchable
              required
              loading={loading}
              {...form.getInputProps("cliente")}
              onChange={(value) => {
                // El Select trabaja con strings; toCreatePayloads lo convierte
                // a número al enviar.
                const clientId = value ?? "";
                form.setFieldValue("cliente", clientId);
                form.values.consolidate_guide.forEach((_, index) => {
                  form.setFieldValue(
                    `consolidate_guide.${index}.client_id`,
                    clientId,
                  );
                });
              }}
            />
            <Select
              label={t("shipment.labels.operation_type")}
              placeholder={t("shipment.placeholders.operation_type")}
              data={[
                { value: "northbound", label: "Exportación" },
                { value: "southbound", label: "Importación" },
              ]}
              autoSelectOnBlur
              searchable
              required
              {...form.getInputProps("type_operation")}
              onChange={(value) => {
                form.setFieldValue("type_operation", value ?? ""); //check this part
              }}
            />
          </Group>

          <Group grow align="flex-start">
            <Select
              label={t("shipment.labels.truck")}
              required
              data={toggleUnit.map((o) => ({
                value: String(o.id),
                label: o.unit,
              }))}
              placeholder={t("shipment.placeholders.truck")}
              description={
                operatorsError ??
                (!operatorsLoading && toggleUnit.length === 0
                  ? "No hay operadores con unidad asignada para este tipo de servicio"
                  : undefined)
              }
              {...form.getInputProps("truck")}
              loading={operatorsLoading}
            />
          </Group>
          {!isConsolidated ? (
            <TrailerFieldsSection form={form} editable />
          ) : (
            <ConsolidatedGuidesSection
              form={form}
              disabled={false}
              loading={loading}
            />
          )}

          <Group grow>
            <TextInput
              label={t("shipment.labels.origen")}
              required
              placeholder={t("shipment.placeholders.origen")}
              {...form.getInputProps("origen")}
            />
            <TextInput
              label={t("shipment.labels.destination")}
              required
              placeholder={t("shipment.placeholders.origen")}
              {...form.getInputProps("destination")}
            />
          </Group>

          <Group justify="end" mt="xl">
            <Button variant="default" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" color="blue">
              Save Shipment
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
