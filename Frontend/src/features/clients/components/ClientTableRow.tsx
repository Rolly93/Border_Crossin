import { Table } from "@mantine/core";
import { ICliente } from "@/features/clients/types/Cliente";
import { AtmoAction } from "@/components/atoms/AtomActionIcon";
import { IconTrash } from "@tabler/icons-react";

interface ClientTableRowProps {
  cliente: ICliente;
  onClick: (client: ICliente) => void
  onDelete: (id: number) => void
}

export function ClientTableRow({ cliente, onClick, onDelete }: ClientTableRowProps) {
  const emailCount = cliente.email?.length ?? 0;



  return (
    <Table.Tr onClick={() => onClick(cliente)} style={{ cursor: 'pointer' }}>
      <Table.Td>{cliente.name}</Table.Td>
      <Table.Td>{cliente.telefono}</Table.Td>
      <Table.Td>{cliente.estatus ? "Activo" : "Inactivo"}</Table.Td>
      <Table.Td>{cliente.sftService ? "Si" : "No"}</Table.Td>
      <Table.Td>{cliente.emailService ? "Si" : "No"}</Table.Td>
      <Table.Td>{emailCount > 0 ? emailCount : "N/A"}</Table.Td>
      <Table.Td>
        <AtmoAction icon={IconTrash}
          color="red" variant={'subtle'}
          title="Eliminar cliente"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(cliente.id)

          }} />

      </Table.Td>
    </Table.Tr>
  )
}