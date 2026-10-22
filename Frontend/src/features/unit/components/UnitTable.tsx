import { Badge, Table, Text } from "@mantine/core";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { AtomButton } from "@/components/atoms/AtomButton";
import { IUnit, UNIT_STATE_COLOR, UnitState } from "../type/unit.interface";

interface UnitTableProps {
  units: IUnit[];
  loading: boolean;
  isAdmin: boolean;
  onEdit: (unit: IUnit) => void;
  onAssign: (unit: IUnit) => void;
  onHistory: (unit: IUnit) => void;
}

export function UnitTable({ units, loading, isAdmin, onEdit, onAssign, onHistory }: UnitTableProps) {
  return (
    <Table.ScrollContainer minWidth={800}>
      <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="md" miw={760}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Número</Table.Th>
            <Table.Th>Placas</Table.Th>
            <Table.Th>Estado</Table.Th>
            <Table.Th>Tag</Table.Th>
            <Table.Th>Operador</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading && units.length === 0 ? (
            <TableSkeletonRows rows={4} columns={6} />
          ) : units.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6}><Text c="dimmed" size="sm">No hay unidades registradas</Text></Table.Td>
            </Table.Tr>
          ) : (
            units.map((unit) => (
              <Table.Tr key={unit.id}>
                <Table.Td>{unit.unitNumber ?? "—"}</Table.Td>
                <Table.Td>{unit.plates}</Table.Td>
                <Table.Td>
                  <Badge color={UNIT_STATE_COLOR[unit.status as UnitState] ?? "gray"} variant="light">
                    {unit.status}
                  </Badge>
                </Table.Td>
                <Table.Td>{unit.tag ?? "—"}</Table.Td>
                <Table.Td>{unit.driverName ?? <Text c="dimmed" span size="sm">Sin asignar</Text>}</Table.Td>
                <Table.Td>
                  <AtomButton size="xs" variant="light" onClick={() => onHistory(unit)}>Historial</AtomButton>
                  {isAdmin && (
                    <>
                      {" "}
                      <AtomButton size="xs" variant="light" color="blue" onClick={() => onEdit(unit)}>Editar</AtomButton>
                      {" "}
                      <AtomButton size="xs" variant="light" color="teal" onClick={() => onAssign(unit)}>Operador</AtomButton>
                    </>
                  )}
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
