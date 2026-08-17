import { ScrollArea } from "@mantine/core";
import { Table } from "@mantine/core";
import { CLIENT } from "@/features/clients/mocks/ClientMock";

import { Title, Text, Group, Button } from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import ClientModalProps from "./ClientModalProps";
import { useState } from "react";
import { ICliente } from "@/features/clients/types/Cliente";
import { useDisclosure } from "@mantine/hooks";

import { ClientMetrics } from "./ClientMetrics";
import { ClientTableRow } from "./ClientTableRow";


export function ClientTable() {
  const [selectedClient, setselectedClient] = useState<ICliente | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure();
  const [client, setClients] = useState<ICliente[]>(CLIENT);
  function handleSelectClient(onSelectClient: ICliente) {
    setselectedClient(onSelectClient)
    openModal()
  }
  function handleCreateClient() {
    setselectedClient(null);
    openModal();
  };

  function handleSaveClient(formData: any) {
    if (selectedClient) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === selectedClient.id
            ? {
              ...c,
              nombre: formData.companyName,
              contacto: formData.mainContact,
              telefono: formData.phoneNumber,
              email: formData.email,
            }
            : c
        )
      );
    } else {
      const newClient: ICliente = {

        name: formData.companyName,
        contacto: formData.mainContact,
        telefono: formData.phoneNumber,
        email: formData.email,
        estatus: true,
        sftService: false,
        emailService: formData.email?.length > 0,
      };
      setClients((prev) => [newClient, ...prev]);
    }
  }


  return (
    <>

      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2} c="gray.9">Cartelera de Clientes</Title>
          <Text size="sm" c="dimmed">Directorio y gestión de clientes activos</Text>
        </div>
        <Group>
          <Button leftSection={<IconPlus size={16} />} color="blue" onClick={handleCreateClient}>
            Agregar Cliente
          </Button>
          <Button variant="default" leftSection={<IconRefresh size={16} />}>
            Actualizar
          </Button>
        </Group>
      </Group>

      <ClientMetrics clients={CLIENT} />
      <ScrollArea>

        <Table
          highlightOnHover
          horizontalSpacing="md"
          verticalSpacing="xs"
          miw={700} layout="fixed"
          mt={25}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Contacto</Table.Th>
              <Table.Th>Telefono</Table.Th>
              <Table.Th>estatus</Table.Th>
              <Table.Th>SFTP Service</Table.Th>
              <Table.Th>Email Service</Table.Th>
              <Table.Th>Email Registrate</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>

            {CLIENT.map((cliente) => (

              <ClientTableRow
                key={cliente.id}
                cliente={cliente}
                onClick={handleSelectClient}
              />
            ))}

          </Table.Tbody>
        </Table>
      </ScrollArea>

      <ClientModalProps
        onSelectClient={selectedClient}
        opened={modalOpened}
        onClose={closeModal}
        onSave={handleSaveClient} />

    </>

  )
}