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
  ActionIcon,
  NumberInput,
  Text,
  Divider,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { ShipmentFormProps } from "@/features/shipments/types/ShipmentFormProps";
import { setupShipmentWatchers } from "../validation/ShipmentFormRules";
import { ShipmentValidator } from "../validation/ShipmentValidator";
import { useTranslation } from "react-i18next";
import { useClientsByOperation } from "@/features/clients/hooks/useClientsByOperation";
import { useClientReferenceRules } from "@/features/clients/hooks/useClientReferenceRules";
import { notifications } from "@mantine/notifications";
import { ValidateClientReference } from "@/components/utils/businessRules";
import { useOperators } from "@/features/employee/hook/useOperators";
import { useState } from "react";
import { TUnitType } from "@/features/unit/hook/useUnits";


export enum TypeOperation {
  NORTHBOUND = "exportacion",
  SOUTHBOUND = "importacion",
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
  const [typeUnit, setTypeUnit] = useState<TUnitType | undefined>(
    (initialData as any)?.vehicle_type as TUnitType
  );

  const toggleUnit = operators.filter((u) => u.typeUnit === typeUnit);

  const { t } = useTranslation();
  const form = useForm({
    mode: "controlled",
    validateInputOnChange: true,
    initialValues: {
      tracking_number: initialData?.tracking_number || "",
      customer_tracking: initialData?.customer_tracking || "",
      type_operation: initialData?.type_operation || "Exportacion",
      service_type: (initialData as any)?.service_type || ServiceType.TRAILER,
      cliente: initialData?.cliente || "",
      truck: initialData?.truck || "",
      vehicle_type: initialData?.vehicle_type || "",
      trailer: initialData?.trailer || "",
      origen: initialData?.origen || "",
      destination: initialData?.destination || "",
      consolidate_guide: (initialData as any)?.consolidate_guide || [
        { guide_number: "", pieces: 1, weight: 0 },
      ],
    },

    validate: (values) => {
      const validator = new ShipmentValidator(values);

      // Si es trailer_53ft exige el tráiler; si es consolidado no es obligatorio
      const isConsolidated = values.service_type === ServiceType.CONSOLIDATED;

      return {
        tracking_number: validator.validateTrackingNumber(),
        truck: validator.validateTruck(),
        origen: validator.validateOrigin(),
        destination: validator.validateDestination(),
        type_operation: validator.validateTypeOperation(),
        trailer: isConsolidated ? null : validator.validateTrailer(),
      };
    },
  });

  setupShipmentWatchers(form);

  const operation = form.values.type_operation;
  const isConsolidated = form.values.service_type === ServiceType.CONSOLIDATED;
  const { clients: clientOptions } = useClientsByOperation(operation);
  const { getRules } = useClientReferenceRules();

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
      const selectedClient = clientOptions.find((c) => c.id === clientId);
      const clientName = selectedClient?.name || "";
      const rules = clientId ? await getRules(clientId) : [];

      const { isValid, field, error } = ValidateClientReference({
        onClientName: clientName,
        onReferenceClient: values.customer_tracking,
        onTypeOperation: values.type_operation,
        rules,
      });

      if (!isValid && field && error) {
        form.setFieldError(field, error);
        return;
      }

      // Ajustamos los valores finales según la lógica de la BD
      const finalPayload = {
        ...values,
        trailer: isConsolidated ? "" : values.trailer,
        consolidate_guide: isConsolidated ? values.consolidate_guide : [],
      };

      await onSubmit(finalPayload as any);
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
          handleValidationError
        )}
      >
        <Stack gap="md">
          <Title order={3}>Shipment Information</Title>

          {/* Selector de Tipo de Servicio */}
          <Select
            label="Tipo de Servicio"
            required
            data={[
              { value: ServiceType.TRAILER, label: "Tráiler 53 ft (FTL)" },
              { value: ServiceType.CONSOLIDATED, label: "Consolidado (3.5t / Rabón)" },
            ]}
            {...form.getInputProps("service_type")}
            onChange={(value) => {
              form.setFieldValue("service_type", value ?? ServiceType.TRAILER);
              if (value === ServiceType.CONSOLIDATED) {
                form.setFieldValue("trailer", "");
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
              data={clientOptions.map((client) => ({
                value: String(client.id),
                label: client.name,
              }))}
              autoSelectOnBlur
              searchable
              required
              {...form.getInputProps("cliente")}
            />
            <Select
              label={t("shipment.labels.operation_type")}
              placeholder={t("shipment.placeholders.operation_type")}
              data={["Exportacion", "Importacion"]}
              autoSelectOnBlur
              searchable
              required
              {...form.getInputProps("type_operation")}
              onChange={(value) => {
                form.setFieldValue("type_operation", value ?? "");
                form.setFieldValue("cliente", "");
              }}
            />
          </Group>

          <Group grow align="flex-start">
            <Select
              label={t("shipment.labels.vehicle_type")}
              required
              placeholder={t("shipment.placeholders.vehicle_type")}
              data={["trailer", "unit truck"]}
              {...form.getInputProps("vehicle_type")}
              onChange={(value) => {
                form.setFieldValue("vehicle_type", value ?? "");
                setTypeUnit(value ? (value as TUnitType) : undefined);
              }}
            />
            <Select
              label={t("shipment.labels.truck")}
              required
              data={toggleUnit.map((o) => ({
                value: String(o.id),
                label: o.unit,
              }))}
              placeholder={t("shipment.placeholders.truck")}
              {...form.getInputProps("truck")}
            />

            {/* Solo se muestra y requiere la caja de tráiler si NO es servicio consolidado */}
            {!isConsolidated && (
              <TextInput
                label={t("shipment.labels.trailer")}
                required
                placeholder={t("shipment.placeholders.trailer")}
                {...form.getInputProps("trailer")}
              />
            )}
          </Group>

          {/* Si es servicio CONSOLIDADO, desplegamos las guías hijas dinámicas */}
          {isConsolidated && (
            <Stack gap="xs">
              <Divider label="Guías del Consolidado" labelPosition="center" my="xs" />
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  Números de Guía / Paquetes
                </Text>
                <Button
                  type="button"
                  variant="default"
                  size="xs"
                  onClick={() =>
                    form.insertListItem("consolidate_guide", {
                      guide_number: "",
                      pieces: 1,
                      weight: 0,
                    })
                  }
                  leftSection={<IconPlus size={14} />}
                >
                  Agregar Guía
                </Button>
              </Group>
              <Stack gap="xs">
                {/* Encabezado fijo de columnas */}
                <Group grow align="center" pr={36}>
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

                {/* Renglones dinámicos sin labels */}
                {form.values.consolidate_guide.map((_: any, index: number) => (
                  <Group key={index} align="center" grow>
                    <TextInput
                      placeholder="Número de Guía"
                      required
                      {...form.getInputProps(`consolidate_guide.${index}.guide_number`)}
                    />
                    <NumberInput
                      placeholder="Piezas"
                      min={1}
                      {...form.getInputProps(`consolidate_guide.${index}.pieces`)}
                    />
                    <NumberInput
                      placeholder="Peso (kg)"
                      decimalScale={2}
                      {...form.getInputProps(`consolidate_guide.${index}.weight`)}
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => form.removeListItem("consolidate_guide", index)}
                      disabled={form.values.consolidate_guide.length === 1}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            </Stack>
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