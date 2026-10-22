import { useState } from 'react';
import { Alert, Container, Group, Title, Stack, Text } from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { AtomButton } from '@/components/atoms/AtomButton';
import { useAuth } from '@/features/login/context/AuthContext';
import { useUnits } from '@/features/unit/hook/useUnits';
import { IUnit } from '@/features/unit/type/unit.interface';
import { UnitTable } from '@/features/unit/components/UnitTable';
import { UnitFormModal } from '@/features/unit/components/UnitFormModal';
import { UnitAssignModal } from '@/features/unit/components/UnitAssignModal';
import { UnitHistoryModal } from '@/features/unit/components/UnitHistoryModal';

type ModalState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; unit: IUnit }
  | { kind: 'assign'; unit: IUnit };

function UnitPage() {
  const { isAdmin } = useAuth();
  const { units, loading, error, setError, refresh, createUnit, updateUnit, assignDriver, releaseDriver } = useUnits();
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [historyUnit, setHistoryUnit] = useState<IUnit | null>(null);

  const close = () => setModal({ kind: 'none' });

  return (
    <Container size="xl">
      <Stack gap="md" mb="lg">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <div>
            <Title order={3} fw={800} c="navy">
              Unidades
            </Title>
            <Text size="sm" c="slate">
              Gestión de flota y asignación de operadores
            </Text>
          </div>
          <Group gap="sm">
            <AtomButton
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={refresh}
              size="sm"
            >
              Actualizar
            </AtomButton>
            {isAdmin && (
              <AtomButton
                leftSection={<IconPlus size={16} />}
                color="amber"
                onClick={() => setModal({ kind: 'create' })}
                size="sm"
              >
                Nueva unidad
              </AtomButton>
            )}
          </Group>
        </Group>

        {error && (
          <Alert color="rose" withCloseButton onClose={() => setError(null)} radius="sm">
            {error}
          </Alert>
        )}
      </Stack>

      <UnitTable
        units={units}
        loading={loading}
        isAdmin={isAdmin}
        onEdit={(unit) => setModal({ kind: 'edit', unit })}
        onAssign={(unit) => setModal({ kind: 'assign', unit })}
        onHistory={setHistoryUnit}
      />

      <UnitFormModal
        opened={modal.kind === 'create' || modal.kind === 'edit'}
        unit={modal.kind === 'edit' ? modal.unit : null}
        onClose={close}
        onSubmit={(input) =>
          modal.kind === 'edit' ? updateUnit(modal.unit.id, input) : createUnit(input)
        }
      />

      <UnitAssignModal
        opened={modal.kind === 'assign'}
        unit={modal.kind === 'assign' ? modal.unit : null}
        onClose={close}
        onAssign={assignDriver}
        onRelease={releaseDriver}
      />

      <UnitHistoryModal
        unitId={historyUnit?.id ?? null}
        unitLabel={historyUnit?.unitNumber ?? ''}
        onClose={() => setHistoryUnit(null)}
      />
    </Container>
  );
}

export default UnitPage;
