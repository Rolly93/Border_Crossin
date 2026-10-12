import { useCallback, useEffect, useState } from "react";
import { clientService } from "../service/clientService";
import { IClientOption } from "../types/IClientService";

export function useClientOptions() {
  const [options, setOptions] = useState<IClientOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setOptions(await clientService.getOptions());
    } catch (err: any) {
      setError(err.message ?? "No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { options, loading, error, reload } as const;
}
