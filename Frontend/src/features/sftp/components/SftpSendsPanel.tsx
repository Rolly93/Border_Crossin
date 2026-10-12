import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Checkbox, Group, Loader, Select, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { clientService } from "@/features/clients/service/clientService";
import { IClientOption } from "@/features/clients/types/IClientService";
import { sftpService } from "../service/sftpService";
import { ISftpSend } from "../types/ISftpSend";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "failed", label: "Fallidos" },
  { value: "pending", label: "Pendientes" },
  { value: "sent", label: "Enviados" },
];

const STATUS_COLOR: Record<string, string> = { failed: "red", pending: "yellow", sent: "green" };
const STATUS_LABEL: Record<string, string> = { failed: "Fallido", pending: "Pendiente", sent: "Enviado" };
const MAX_AUTO_RETRIES = 3;

export function SftpSendsPanel() {
  const [clients, setClients] = useState<IClientOption[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [debouncedReference, setDebouncedReference] = useState("");
  const [status, setStatus] = useState<string | null>("failed");
  const [sends, setSends] = useState<ISftpSend[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientService.getOptions().then(setClients).catch(() => setClients([]));
  }, []);

  // Espera a que el usuario deje de escribir antes de consultar.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedReference(reference.trim()), 400);
    return () => clearTimeout(timer);
  }, [reference]);

  const loadSends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sftpService.getSends({
        client_id: clientId ? Number(clientId) : undefined,
        reference: debouncedReference || undefined,
        status: status || undefined,
      });
      setSends(data);
      setSelected(new Set());
    } catch (err: any) {
      setError(err.response?.data?.detail ?? err.message ?? "No se pudieron cargar los envíos");
    } finally {
      setLoading(false);
    }
  }, [clientId, debouncedReference, status]);

  useEffect(() => {
    loadSends();
  }, [loadSends]);

  const clientNames = useMemo(() => new Map(clients.map((c) => [c.id, c.name])), [clients]);
  const failedIds = sends.filter((s) => s.status === "failed").map((s) => s.id);
  const selectedIds = [...selected];
  const selectedFailed = selectedIds.filter((id) => failedIds.includes(id));
  const skipped = selectedIds.length - selectedFailed.length;

  const toggleOne = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(selected.size === sends.length ? new Set() : new Set(sends.map((s) => s.id)));

  const resend = async (ids: number[]) => {
    if (ids.length === 0) return;
    setResending(true);
    try {
      const result = await sftpService.resend(ids);
      const sent = result.filter((r) => r.status === "sent").length;
      notifications.show({
        title: "Reenvío terminado",
        message: `${sent} de ${result.length} archivos enviados`,
        color: sent === result.length ? "green" : "orange",
      });
    } catch (err: any) {
      notifications.show({
        title: "Error al reenviar",
        message: err.response?.data?.detail ?? err.message,
        color: "red",
      });
    } finally {
      setResending(false);
      await loadSends();
    }
  };

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
          value={clientId}
          onChange={setClientId}
          clearable
          searchable
        />
        <TextInput
          label="Referencia"
          placeholder="Ej. 12B..."
          value={reference}
          onChange={(e) => setReference(e.currentTarget.value)}
        />
        <Select
          label="Estado"
          data={STATUS_OPTIONS}
          value={status ?? ""}
          onChange={(value) => setStatus(value || null)}
        />
      </Group>

      <Group justify="space-between">
        <Text size="sm">{sends.length} archivos · {selectedFailed.length} seleccionados para reintento</Text>
        <Group>
          <Button
            variant="light"
            onClick={() => resend(selectedFailed)}
            disabled={selectedFailed.length === 0 || resending}
            loading={resending}
          >
            Reintentar seleccionados
          </Button>
          <Button
            color="red"
            onClick={() => resend(failedIds)}
            disabled={failedIds.length === 0 || resending}
            loading={resending}
          >
            Reintentar fallidos
          </Button>
        </Group>
      </Group>

      {skipped > 0 && (
        <Alert color="yellow">
          {skipped} seleccionado(s) no están fallidos y se omitirán al reintentar.
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
                  checked={selected.size === sends.length && sends.length > 0}
                  indeterminate={selected.size > 0 && selected.size < sends.length}
                  onChange={toggleAll}
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
                    checked={selected.has(send.id)}
                    onChange={() => toggleOne(send.id)}
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
