import { useState } from "react";
import { Alert, Container, Group, Title } from "@mantine/core";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { AtomButton } from "@/components/atoms/AtomButton";
import { useAuth } from "@/features/login/context/AuthContext";
import { useUnits } from "@/features/unit/hook/useUnits";
import { IUnit } from "@/features/unit/type/unit.interface";
import { UnitTable } from "@/features/unit/components/UnitTable";
import { UnitFormModal } from "@/features/unit/components/UnitFormModal";
import { UnitAssignModal } from "@/features/unit/components/UnitAssignModal";
import { UnitHistoryModal } from "@/features/unit/components/UnitHistoryModal";

type ModalState =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; unit: IUnit }
  | { kind: "assign"; unit: IUnit };

export function UnitPage() {
  const { isAdmin } = useAuth();
  const { units, loading, error, setError, refresh, createUnit, updateUnit, assignDriver, releaseDriver } = useUnits();
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [historyUnit, setHistoryUnit] = useState<IUnit | null>(null);

  const close = () => setModal({ kind: "none" });

  return (
    <Container size="xl">
      <Group justify="space-between" mt="md" wrap="wrap">
        <Title order={3}>Unidades</Title>
        <Group>
          <AtomButton variant="light" leftSection={<IconRefresh size={16} />} onClick={refresh}>
            Actualizar
          </AtomButton>
          {/* Solo administradores registran o modifican unidades. */}
          {isAdmin && (
            <AtomButton leftSection={<IconPlus size={16} />} color="blue" onClick={() => setModal({ kind: "create" })}>
              Nueva unidad
            </AtomButton>
          )}
        </Group>
      </Group>

      {error && (
        <Alert color="red" mt="md" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <UnitTable
        units={units}
        loading={loading}
        isAdmin={isAdmin}
        onEdit={(unit) => setModal({ kind: "edit", unit })}
        onAssign={(unit) => setModal({ kind: "assign", unit })}
        onHistory={setHistoryUnit}
      />

      <UnitFormModal
        opened={modal.kind === "create" || modal.kind === "edit"}
        unit={modal.kind === "edit" ? modal.unit : null}
        onClose={close}
        onSubmit={(input) =>
          modal.kind === "edit" ? updateUnit(modal.unit.id, input) : createUnit(input)
        }
      />

      <UnitAssignModal
        opened={modal.kind === "assign"}
        unit={modal.kind === "assign" ? modal.unit : null}
        onClose={close}
        onAssign={assignDriver}
        onRelease={releaseDriver}
      />

      <UnitHistoryModal
        unitId={historyUnit?.id ?? null}
        unitLabel={historyUnit?.unitNumber ?? ""}
        onClose={() => setHistoryUnit(null)}
      />
    </Container>
  );
}
