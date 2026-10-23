import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Badge, Button, Group, Loader, Stack, Table, Text, Title } from "@mantine/core";
import SftModal from "@/components/Modal/SftModalProps";
import { useClientOptions } from "@/features/clients/hooks/useClientOptions";

export function SftpClientList() {
  const { options: clients, loading, error, reload } = useClientOptions();
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [opened, setOpened] = useState<boolean>(false);

  const openConfig = (id: number) => {
    setSelectedId(id);
    setOpened(true);
  };

  // Si llega ?client=ID (desde el aviso al crear un cliente), abre su configuración.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const requested = Number(searchParams.get("client"));
    if (requested && clients.some((c) => c.id === requested)) {
      openConfig(requested);
      setSearchParams({}, { replace: true });
    }
  }, [clients, searchParams, setSearchParams]);

  // Al cerrar el modal se recarga el estado, por si se creó o eliminó una configuración.
  const closeConfig = () => {
    setOpened(false);
    reload();
  };

  return (
    <Stack>
      <Title order={3}>Conexiones SFTP por cliente</Title>

      {error && <Alert color="red">{error}</Alert>}

      {loading ? (
        <Loader />
      ) : clients.length === 0 ? (
        <Text c="dimmed">No hay clientes activos.</Text>
      ) : (
        <Table striped highlightOnHover >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Estado SFTP</Table.Th>
              <Table.Th >Opciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {clients.map((client) => (
              <Table.Tr key={client.id}>
                <Table.Td>{client.name}</Table.Td>
                <Table.Td>
                  <Badge color={client.sftService ? "green" : "gray"} variant="light">
                    {client.sftService ? "Configurado" : "Sin configurar"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Button size="xs" variant="light" onClick={() => openConfig(client.id)}>
                    {client.sftService ? "Editar" : "Configurar"}
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <SftModal clientId={selectedId} opened={opened} onClose={closeConfig} />
    </Stack>
  );
}
