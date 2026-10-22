import { useEffect, useState } from "react";
import { clientService } from "../service/clientService";
import { IClientNameOption } from "../types/IClientService";

/** Clientes que operan un tipo de operación (Importacion / Exportacion). */
export function useClientsByOperation(operation: string) {
  const [clients, setClients] = useState<IClientNameOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!operation) {
      setClients([]);
      return;
    }
    let active = true;
    setLoading(true);
    clientService
      .getByOperation(operation)
      .then((list) => {
        if (active) {
          setClients(list);
        }
      })
      .catch(() => {
        if (active) {
          setClients([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [operation]);

  return { clients, loading } as const;
}
