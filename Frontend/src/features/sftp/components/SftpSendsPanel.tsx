import { Alert, Badge, Button, Checkbox, Group, Loader, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useClientOptions } from '@/features/clients/hooks/useClientOptions';
import { MAX_AUTO_RETRIES, useSftpSends } from '../hooks/useSftpSends';
import { SftpSendStatus } from '../types/ISftpSend';

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "failed", label: "Fallidos" },
  { value: "pending", label: "Pendientes" },
  { value: "sent", label: "Enviados" },
];
const STATUS_COLOR: Record<string, string> = { failed: "red", pending: "yellow", sent: "green" };
const STATUS_LABEL: Record<string, string> = { failed: "Fallido", pending: "Pendiente", sent: "Enviado" };

export function SftpSendsPanel() {
  const { options: clients } = useClientOptions();
  const { sends, loading, error, resending, filters, selection, retrySelected, retryFailed, failedCount } = useSftpSends();
  const clientNames = new Map(clients.map((c) => [c.id, c.name]));

  return (
    <Stack>
      <Title order={3}>Envíos XML</Title>
      <Text size="sm" c="dimmed">
        Archivos generados por evento. Reintentos automáticos: {MAX_AUTO_RETRIES}. Después se reintentan aquí manualmente.
      </Text>

      <Group align="flex-end" grow>
        <Select
          label="Cliente"
          placeholder="Todos"
          data={clients.map((c) => ({ value: String(c.id), label: c.name }))}
          value={filters.clientId}
          onChange={filters.setClientId}
          clearable
          searchable
        />

        <TextInput
          label="Referencia"
          placeholder="Ej. 12b, 82B..."
          value={filters.reference}
          onChange={(e) => filters.setReference(e.currentTarget.value)}
        />
        <Select
          label="Estado"
          data={STATUS_OPTIONS}
          value={filters.status ?? ''}
          onChange={(value) => filters.setStatus((value as SftpSendStatus) || null)}
        />
      </Group>

      <Group justify="space-between">
        <Text size="sm">{sends.length} archivos · {selection.selectedFailed.length} seleccionados para reintento</Text>
        <Group>
          <Button
            variant="light"
            onClick={retrySelected}
            disabled={selection.selectedFailed.length === 0 || resending}
            loading={resending}
          >
            Reintentar seleccionados
          </Button>
          <Button
            color="red"
            onClick={retryFailed}
            disabled={failedCount === 0 || resending}
            loading={resending}
          >
            Reintentar fallidos
          </Button>
        </Group>
      </Group>

      {selection.skippedCount > 0 && (
        <Alert color="yellow">
          {selection.skippedCount} seleccionado(s) no están fallidos y se omitirán al reintentar.
        </Alert>
      )}

      {error && <Alert color="red">{error}</Alert>}

      {loading ? (
        <Loader />
      ) : sends.length === 0 ? (
        <Text c="dimmed">No hay archivos con estos filtros.</Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Checkbox
                  aria-label="Seleccionar todos"
                  checked={selection.allSelected}
                  indeterminate={selection.someSelected}
                  onChange={selection.toggleAll}
                />
              </Table.Th>
              <Table.Th>Archivo</Table.Th>
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Referencia</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Reintentos</Table.Th>
              <Table.Th>Último error</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sends.map((send) => (
              <Table.Tr key={send.id}>
                <Table.Td>
                  <Checkbox
                    aria-label={`Seleccionar ${send.filename}`}
                    checked={selection.selected.has(send.id)}
                    onChange={() => selection.toggleOne(send.id)}
                  />
                </Table.Td>
                <Table.Td>{send.filename}</Table.Td>
                <Table.Td>{clientNames.get(send.client_id) ?? send.client_id}</Table.Td>
                <Table.Td>{send.reference}</Table.Td>
                <Table.Td>
                  <Badge color={STATUS_COLOR[send.status]} variant="light">
                    {STATUS_LABEL[send.status] ?? send.status}
                  </Badge>
                </Table.Td>
                <Table.Td>{send.retries} / {MAX_AUTO_RETRIES}</Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2} title={send.sftp_log ?? ""}>
                    {send.sftp_log ?? "—"}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
