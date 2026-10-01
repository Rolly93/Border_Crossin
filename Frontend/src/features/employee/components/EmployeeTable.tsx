import { Modal, Table } from "@mantine/core";
import { IEmployee } from "../type/employee.interface";
import { useState, useRef, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { useEmployee } from "../hook/useEmployee";
import { EmployeeTableRow } from "./EmployeeTableRow";
import { EmployeeForm } from "./EmployeeForm";

export function EmployeeTable() {
  const { employeeData, loading, hasMore, fetchNextPage } = useEmployee();
  const observer = useRef<IntersectionObserver | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee>()
  const [csrModal, { open: openCsrModal, close: closeCsrModal }] = useDisclosure()
  const [driverModal, { open: opendriverModal, close: closedriverModal }] = useDisclosure()

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

  async function handelSelectedEmployee(onSelectEmployee: IEmployee) {
    const role = onSelectEmployee.role.toLowerCase()

    switch (role) {
      case 'csr': openCsrModal()

        break;
      case 'driver': opendriverModal()

      default:
        break;
    }

  }

  return (
    <>
      <Modal opened={csrModal}
        onClose={closeCsrModal}
        title='Registrar Nuevo CSR'
        centered
        size={'lg'}>
        <EmployeeForm onClose={closeCsrModal} />
      </Modal>
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
                onClick={handelSelectedEmployee}
              />)
            }))}
            {loading && <TableSkeletonRows rows={4} columns={6} />}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer></>)
}