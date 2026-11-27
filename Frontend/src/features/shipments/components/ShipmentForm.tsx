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
import { useClientReferenceRules } from "@/features/clients/hooks/useClientReferenceRules";
import { notifications } from "@mantine/notifications";
import { ValidateClientReference } from "@/components/utils/businessRules";
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
  const { operators } = useOperators(opened);

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
    validate: (values) => {
      const validator = new ShipmentValidator(values);
      console.log(values);

      const isConsolidated = values.service_type === ServiceType.CONSOLIDATED;
      const trailerErrors = isConsolidated ? {} : validator.validateTrailer;

      return {
        tracking_number: validator.validateTrackingNumber(),
        truck: validator.validateTruck(),
        origen: validator.validateOrigin(),
        destination: validator.validateDestination(),
        type_operation: validator.validateTypeOperation(),
        ...trailerErrors,
      };
    },
  });

  setupShipmentWatchers(form);
  const toggleUnit = operators.filter(
    (u) => u.typeUnit === form.values.service_type,
  );

  const isConsolidated = form.values.service_type === ServiceType.CONSOLIDATED;
  const { options, loading, error } = useClientOptions();
  //const { getRules } = useClientReferenceRules();

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
      const clientId = Number(values.cliente);
      const selectedClient = options.find((c) => c.id === clientId);
      //      const clientName = selectedClient?.name || "";
      //      const rules = clientId ? await getRules(clientId) : [];

      //      const { isValid, field, error } = ValidateClientReference({
      //        onClientName: clientName,
      //        onReferenceClient: values.customer_tracking,
      //        onTypeOperation: values.type_operation,
      //        rules,
      //      });
      //
      //      if (!isValid && field && error) {
      //        form.setFieldError(field, error);
      //        return;
      //      }

      await onSubmit(values);
    } catch (err: any) {
      if (typeof err === "object" && !err.message) {
        form.setErrors(err);
      } else if (err.message) {
        console.log(err);
        form.setFieldError("customer_tracking", err.message);
      }
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
                const numericId = value ? Number(value) : null;
                console.log(numericId);

                form.setFieldValue("cliente", numericId);
                form.values.consolidate_guide.forEach((_, index) => {
                  form.setFieldValue(
                    `consolidate_guide.${index}.client_id`,
                    numericId,
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
              {...form.getInputProps("truck")}
              loading={loading}
            />
          </Group>
          {!isConsolidated ? (
            <TrailerFieldsSection form={form} editable={true} />
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
