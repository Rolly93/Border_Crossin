import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Group, Loader, Stack, Table, Text, Title } from "@mantine/core";
import SftModal from "@/components/Modal/SftModalProps";
import { clientService } from "@/features/clients/service/clientService";
import { IClientOption } from "@/features/clients/types/IClientService";

export function SftpClientList() {
  const [clients, setClients] = useState<IClientOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [opened, setOpened] = useState<boolean>(false);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setClients(await clientService.getOptions());
    } catch (err: any) {
      setError(err.message || "No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const openConfig = (id: number) => {
    setSelectedId(id);
    setOpened(true);
  };

  // Al cerrar el modal se recarga el estado, por si se creó o eliminó una configuración.
  const closeConfig = () => {
    setOpened(false);
    loadClients();
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
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Estado SFTP</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {clients.map((client) => (
              <Table.Tr key={client.id}>
                <Table.Td>{client.name}</Table.Td>
                <Table.Td>
                  <Badge color={client.has_sftp ? "green" : "gray"} variant="light">
                    {client.has_sftp ? "Configurado" : "Sin configurar"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <Button size="xs" variant="light" onClick={() => openConfig(client.id)}>
                      {client.has_sftp ? "Editar" : "Configurar"}
                    </Button>
                  </Group>
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
