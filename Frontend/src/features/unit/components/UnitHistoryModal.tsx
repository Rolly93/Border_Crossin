import { Modal, Table, Text, Badge } from "@mantine/core";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { useUnitHistory } from "../hook/useUnitHistory";

interface UnitHistoryModalProps {
  unitId: number | null;
  unitLabel: string;
  onClose: () => void;
}

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "—";

export function UnitHistoryModal({ unitId, unitLabel, onClose }: UnitHistoryModalProps) {
  const { history, loading, error } = useUnitHistory(unitId);

  return (
    <Modal opened={unitId !== null} onClose={onClose} title={`Historial · ${unitLabel}`} centered size="lg">
      {error && <Text c="red" size="sm">{error}</Text>}
      <Table.ScrollContainer minWidth={500}>
        <Table verticalSpacing="xs" horizontalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Operador</Table.Th>
              <Table.Th>Desde</Table.Th>
              <Table.Th>Hasta</Table.Th>
              <Table.Th>Estado</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <TableSkeletonRows rows={3} columns={4} />
            ) : history.length === 0 ? (
              <Table.Tr><Table.Td colSpan={4}><Text c="dimmed" size="sm">Sin asignaciones</Text></Table.Td></Table.Tr>
            ) : (
              history.map((h) => (
                <Table.Tr key={h.id}>
                  <Table.Td>{h.driverName}</Table.Td>
                  <Table.Td>{formatDate(h.assignedAt)}</Table.Td>
                  <Table.Td>{formatDate(h.releasedAt)}</Table.Td>
                  <Table.Td>
                    <Badge color={h.releasedAt ? "gray" : "green"} variant="light">
                      {h.releasedAt ? "Cerrada" : "Vigente"}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Modal>
  );
}
