import { useCallback, useEffect, useMemo, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useDebouncedValue } from '@/components/hook/useDebouncedValue';
import { sftpService } from '../service/sftpService';
import { ISftpSend, SftpSendStatus, SftpSendFilters } from '../types/ISftpSend';
import { getErrorMessage } from '@/components/utils/errorMessage';

export const MAX_AUTO_RETRIES = 3;

export function useSftpSends() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [reference, setReference] = useState<string>('');
  const [status, setStatus] = useState<SftpSendStatus | null>(null);
  const debouncedReference = useDebouncedValue(reference.trim());

  const [sends, setSends] = useState<ISftpSend[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: SftpSendFilters = {
        client_id: clientId ? Number(clientId) : undefined,
        reference: debouncedReference || undefined,
        status: status || undefined,
      };
      const data = await sftpService.listSends(filters);
      setSends(data);
      setSelected(new Set());
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudieron cargar los envíos'));
    } finally {
      setLoading(false);
    }
  }, [clientId, debouncedReference, status]);

  useEffect(() => {
    load();
  }, [load]);

  const failedIds = useMemo(
    () => sends.filter((s) => s.status === 'failed').map((s) => s.id),
    [sends]
  );
  const selectedFailed = useMemo(
    () => [...selected].filter((id) => failedIds.includes(id)),
    [selected, failedIds]
  );
  const skippedCount = selected.size - selectedFailed.length;
  const allSelected = sends.length > 0 && selected.size === sends.length;
  const someSelected = selected.size > 0 && selected.size < sends.length;

  const toggleOne = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === sends.length ? new Set() : new Set(sends.map((s) => s.id))
    );
  }, [sends]);

  const resend = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return;
    setResending(true);
    try {
      const result = await sftpService.resend(ids);
      const sent = result.filter((r) => r.status === 'sent').length;
      notifications.show({
        title: 'Reenvío terminado',
        message: `${sent} de ${result.length} archivos enviados`,
        color: sent === result.length ? 'green' : 'orange',
      });
    } catch (err: unknown) {
      notifications.show({
        title: 'Error al reenviar',
        message: getErrorMessage(err, 'No se pudo reenviar'),
        color: 'red',
      });
    } finally {
      setResending(false);
      await load();
    }
  }, [load]);

  return {
    sends,
    loading,
    error,
    resending,
    filters: { clientId, setClientId, reference, setReference, status, setStatus },
    selection: { selected, selectedFailed, skippedCount, allSelected, someSelected, toggleOne, toggleAll },
    retrySelected: () => resend(selectedFailed),
    retryFailed: () => resend(failedIds),
    failedCount: failedIds.length,
  } as const;
}
