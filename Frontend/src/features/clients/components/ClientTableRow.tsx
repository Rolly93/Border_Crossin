import { Table } from "@mantine/core";
import { ICliente } from "@/features/clients/types/Cliente";
import ClientModalProps from "./ClientModalProps";

interface ClientTableRowProps {
  cliente: ICliente;
  onClick: (client: ICliente) => void
}

export function ClientTableRow({ cliente, onClick }: ClientTableRowProps) {
  const emailCount = cliente.email?.length ?? 0;
  return (
    <Table.Tr onClick={() => onClick(cliente)} style={{ cursor: 'pointer' }}>
      <Table.Td>{cliente.name}</Table.Td>
      <Table.Td>{cliente.telefono}</Table.Td>
      <Table.Td>{cliente.estatus ? "Activo" : "Inactivo"}</Table.Td>
      <Table.Td>{cliente.sftService ? "Si" : "No"}</Table.Td>
      <Table.Td>{cliente.emailService ? "Si" : "No"}</Table.Td>
      <Table.Td>{emailCount > 0 ? emailCount : "N/A"}</Table.Td>
    </Table.Tr>
  )
}