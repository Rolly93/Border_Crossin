import { Table } from "@mantine/core";

export function EmployeeTable() {

  return (<Table.ScrollContainer minWidth={760} h={500}>
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

      </Table.Tbody>
    </Table>
  </Table.ScrollContainer>)
}