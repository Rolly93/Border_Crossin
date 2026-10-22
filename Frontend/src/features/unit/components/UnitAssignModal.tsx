import { useState } from "react";
import { Alert, Modal, Select, Stack, Text, Group } from "@mantine/core";
import { AtomButton } from "@/components/atoms/AtomButton";
import { useOperators } from "@/features/employee/hook/useOperators";
import { IUnit } from "../type/unit.interface";

interface UnitAssignModalProps {
  opened: boolean;
  unit: IUnit | null;
  onClose: () => void;
  onAssign: (unitId: number, driverId: number) => Promise<boolean>;
  onRelease: (unitId: number) => Promise<boolean>;
}

export function UnitAssignModal({ opened, unit, onClose, onAssign, onRelease }: UnitAssignModalProps) {
  const { operators, loading, error } = useOperators(opened);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!unit) {
    return null;
  }

  const handleAssign = async () => {
    if (!driverId) {
      return;
    }
    setSubmitting(true);
    const ok = await onAssign(unit.id, Number(driverId));
    setSubmitting(false);
    if (ok) {
      setDriverId(null);
      onClose();
    }
  };

  const handleRelease = async () => {
    setSubmitting(true);
    const ok = await onRelease(unit.id);
    setSubmitting(false);
    if (ok) {
      onClose();
    }
  };

  const canAssign = unit.state === "ACTIVA";

  return (
    <Modal opened={opened} onClose={onClose} title={`Operador de la unidad ${unit.unitNumber ?? ""}`} centered>
      <Stack gap="sm">
        <Text size="sm">
          Operador actual: <b>{unit.driverName ?? "Sin operador"}</b>
        </Text>

        {error && <Alert color="red">{error}</Alert>}

        {!canAssign && (
          <Alert color="yellow">
            Solo se asignan operadores a unidades activas. Cambia el estado a Activa para asignar.
          </Alert>
        )}

        <Select
          label="Nuevo operador"
          placeholder={loading ? "Cargando..." : "Selecciona un operador"}
          data={operators.map((o) => ({ value: String(o.id), label: o.name }))}
          value={driverId}
          onChange={setDriverId}
          searchable
          disabled={!canAssign}
          nothingFoundMessage="Sin operadores registrados"
        />

        <Group justify="flex-end" mt="md">
          {unit.driverId !== null && (
            <AtomButton color="red" variant="light" onClick={handleRelease} loading={submitting}>
              Liberar unidad
            </AtomButton>
          )}
          <AtomButton variant="default" onClick={onClose}>Cancelar</AtomButton>
          <AtomButton onClick={handleAssign} loading={submitting} disabled={!driverId || !canAssign}>
            Asignar
          </AtomButton>
        </Group>
      </Stack>
    </Modal>
  );
}
