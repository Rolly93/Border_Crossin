import { useEffect, useState } from "react";
import { Modal, Select, Stack, TextInput, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { AtomButton } from "@/components/atoms/AtomButton";
import { IUnit, IUnitInput, UNIT_STATE_OPTIONS, UnitState } from "../type/unit.interface";

interface UnitFormModalProps {
  opened: boolean;
  unit: IUnit | null; // null = alta
  onClose: () => void;
  onSubmit: (input: IUnitInput) => Promise<boolean>;
}

interface UnitFormValues {
  plates: string;
  unitNumber: string;
  state: UnitState;
  tag: string;
}

export function UnitFormModal({ opened, unit, onClose, onSubmit }: UnitFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<UnitFormValues>({
    initialValues: { plates: "", unitNumber: "", state: "ACTIVA", tag: "" },
    validate: {
      plates: (v) => (v.trim() ? null : "Requerido"),
      unitNumber: (v) => (v.trim() ? null : "Requerido"),
      tag: (v) => (v.trim().length > 24 ? "Máximo 24 caracteres" : null),
    },
  });

  // Al abrir en modo edición, carga la unidad seleccionada.
  useEffect(() => {
    if (!opened) {
      return;
    }
    form.setValues({
      plates: unit?.plates ?? "",
      unitNumber: unit?.unitNumber ?? "",
      state: unit?.status ?? "ACTIVA",
      tag: unit?.tag ?? "",
    });
    form.resetDirty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, unit]);

  const handleSubmit = async (values: UnitFormValues) => {
    setSubmitting(true);
    const ok = await onSubmit({
      plates: values.plates.trim(),
      unitNumber: values.unitNumber.trim(),
      state: values.state,
      tag: values.tag.trim() || undefined,
    });
    setSubmitting(false);
    if (ok) {
      onClose();
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={unit ? "Editar unidad" : "Nueva unidad"} centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <Group grow>
            <TextInput label="Número de unidad" required {...form.getInputProps("unitNumber")} />
            <TextInput label="Placas" required {...form.getInputProps("plates")} />
          </Group>
          <Group grow>
            <Select label="Estado" data={UNIT_STATE_OPTIONS} allowDeselect={false}
              {...form.getInputProps("state")} />
            <TextInput label="Tag" {...form.getInputProps("tag")} />
          </Group>
          <Group justify="flex-end" mt="md">
            <AtomButton variant="default" onClick={() => { onClose(); }}>Cancelar</AtomButton>
            <AtomButton type="submit" loading={submitting}>Guardar</AtomButton>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
