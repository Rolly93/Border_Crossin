import { Table } from "@mantine/core";
import { ICliente } from "@/features/clients/types/Cliente";
import { AtmoAction } from "@/components/atoms/AtomActionIcon";
import { IconTrash, IconRefresh } from "@tabler/icons-react";
import { forwardRef } from "react";

interface ClientTableRowProps {
  cliente: ICliente;
  onClick: (client: ICliente) => void
  onDelete: (id: number) => void
  onActivate: (id: number) => void
}


export const ClientTableRow = forwardRef<HTMLTableRowElement, ClientTableRowProps>(({ cliente, onClick, onDelete, onActivate }, ref) => {
  const emailCount = cliente.email?.length ?? 0;

  return (
    <Table.Tr ref={ref} onClick={() => onClick(cliente)} style={{ cursor: 'pointer' }}>
      <Table.Td>{cliente.name}</Table.Td>
      <Table.Td>{cliente.telefono}</Table.Td>
      <Table.Td>{cliente.still_active ? "Activo" : "Inactivo"}</Table.Td>
      <Table.Td>{cliente.sftService ? "Si" : "No"}</Table.Td>
      <Table.Td>{cliente.emailService ? "Si" : "No"}</Table.Td>
      <Table.Td>{emailCount > 0 ? emailCount : "N/A"}</Table.Td>
      <Table.Td>
        <AtmoAction
          icon={IconTrash}
          color="red"
          variant={'subtle'}
          title="Eliminar cliente"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(cliente.id);
          }}
        />
        <AtmoAction
          icon={IconRefresh}
          color="green"
          title="Reactive Cliente"
          onClick={(e) => {
            e.stopPropagation();
            onActivate(cliente.id)
          }} />
      </Table.Td>
    </Table.Tr>

  )
})