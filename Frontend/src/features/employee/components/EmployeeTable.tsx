import { Group, Table, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useRef, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { AtomButton } from "@/components/atoms/AtomButton";
import { useAuth } from "@/features/login/context/AuthContext";
import { useEmployee } from "../hook/useEmployee";
import { useNewEmployeeForm } from "../hook/useNewEmployeeForm";
import { EmployeeTableRow } from "./EmployeeTableRow";
import { NewEmployeeModal } from "./NewEmployeeModal";

export function EmployeeTable() {
  const { isAdmin } = useAuth();
  const { employeeData, loading, hasMore, fetchNextPage, createEmployeeAccount } = useEmployee();
  const employeeForm = useNewEmployeeForm(createEmployeeAccount);
  const [newModal, { open: openNewModal, close: closeNewModal }] = useDisclosure(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (loading) { return }
    if (observer.current) { observer.current.disconnect() }

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchNextPage();
      }
    })
    if (node) { return observer.current.observe(node) }

  }, [loading, hasMore, fetchNextPage])

  return (
    <>
      <Group justify="space-between" mt="md">
        <Title order={3}>Empleados</Title>
        {/* Solo administradores dan de alta empleados; el backend también lo valida. */}
        {isAdmin && (
          <AtomButton leftSection={<IconPlus size={16} />} color="blue" onClick={openNewModal}>
            Nuevo empleado
          </AtomButton>
        )}
      </Group>

      <NewEmployeeModal opened={newModal} onClose={closeNewModal} employeeForm={employeeForm} />

      <Table.ScrollContainer minWidth={760} h={500}>
        <Table highlightOnHover
          horizontalSpacing={'md'}
          verticalSpacing={'xs'}
          miw={700} layout={'fixed'}
          stickyHeader
          mt={25}>

          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Apellido</Table.Th>
              <Table.Th>Cargo</Table.Th>
              <Table.Th>Fecha de Ingreso</Table.Th>
              <Table.Th>R.F.C</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading && employeeData.length === 0 ? (
              <TableSkeletonRows rows={4} columns={5} />
            ) : (employeeData.map((employee, index) => {
              const isLastElement = employeeData.length === index + 1;
              return (<EmployeeTableRow
                employee={employee}
                ref={isLastElement ? lastElementRef : null}
                key={employee.id}
                onClick={() => { }}
              />)
            }))}
            {loading && <TableSkeletonRows rows={4} columns={5} />}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>)
}
