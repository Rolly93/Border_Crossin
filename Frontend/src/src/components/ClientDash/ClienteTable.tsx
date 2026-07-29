import { ScrollArea } from "@mantine/core";
import { Table } from "@mantine/core";
import { CLIENT } from "@/mocks/ClientMock";

import { Title, Text, Group, Button, Card, SimpleGrid, ThemeIcon } from '@mantine/core';
import { IconBuilding, IconCheck, IconMail, IconFileText, IconPlus, IconRefresh } from '@tabler/icons-react';
import ClientModalProps from "../Modal/ClientModalProps";
import { useState } from "react";
import { ICliente } from "@/types/Cliente";
import { useDisclosure } from "@mantine/hooks";
import ActionCard from "../Card/Card";


export function ClientTable() {
  const [selectedClient, setselectedClient] = useState<ICliente | null>(null);
  const [opened, { open, close }] = useDisclosure();

  const totalClient = CLIENT.length
  const clientesActivos = CLIENT.filter(c => c.estatus).length;
  const sftActivos = CLIENT.filter(c => c.estatus && c.sftService).length;
  const emaiActivos = CLIENT.filter(c => c.estatus && c.emailService).length;

  function handelClickClient(onSelectClient: ICliente) {
    setselectedClient(onSelectClient)
    open()
  }


  return (
    <>

      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2} c="gray.9">Cartelera de Clientes</Title>
          <Text size="sm" c="dimmed">Directorio y gestión de clientes activos</Text>
        </div>
        <Group>
          <Button leftSection={<IconPlus size={16} />} color="blue">
            Agregar Cliente
          </Button>
          <Button variant="default" leftSection={<IconRefresh size={16} />}>
            Actualizar
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
  

        <ActionCard        
        title="Clientes Activos"        
        icon={<IconBuilding size={20} />}        
        color=""        
        statusText={'Clientes'}        
        metric={totalClient}        
        metricLabel="Total de Clientes registrados"/>

<ActionCard
        title="Activos"
        icon={<IconCheck size={20} />}
        color="teal"
        statusText={'Clientes Activos'}
        metric={clientesActivos}
        metricLabel="Activos"

    />
<ActionCard
        title="Email Notification"
        icon={<IconMail size={20} />}
        color="yellow"
        statusText={'con Servicio de alertas Email'}
        metric={emaiActivos}
        metricLabel="Activos"

    />
<ActionCard
        title="SFTP Notification"
        icon={<IconFileText size={20} />}
        color="grape"
        statusText={'con conexion SFTP'}
        metric={sftActivos}
        metricLabel="Activos"

    />

      </SimpleGrid>
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
              <Table.Th>Email Serice</Table.Th>
              <Table.Th>Email Registrate</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>

            {CLIENT.map((cliente) => (

              <Table.Tr key={cliente.id} onClick={() => handelClickClient(cliente)}>
                <Table.Td>{cliente.name}</Table.Td>
                <Table.Td>{cliente.contacto}</Table.Td>
                <Table.Td>{cliente.telefono}</Table.Td>
                <Table.Td>{cliente.estatus ? "Activo" : "Inactivo"}</Table.Td>
                <Table.Td>{cliente.sftService ? "Si" : "No"}</Table.Td>
                <Table.Td>{cliente.emailService ? "Si" : "No"}</Table.Td>
                <Table.Td>{cliente.email?.length! >= 0 ? cliente.email?.length : "N/A"}</Table.Td>
              </Table.Tr>
            ))}

          </Table.Tbody>
        </Table>
      </ScrollArea>

      <ClientModalProps
        onSelectClient={selectedClient}
        opened={opened}
        onClose={close} />

    </>

  )
}