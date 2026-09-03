import { useCallback, useEffect, useState } from "react";
import { ICliente } from "../types/Cliente";
import { clientService } from "../service/clientService";
import { ClientMetricsResponse } from "../types/IClientService";
const PAGE_SIZE = 10;

interface ClientOption {
  id: number;
  name: string;
}
export function useClients() {
  const [clients, setClients] = useState<ICliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [clientsName, setClientsName] = useState<ClientOption[]>([]);
  const [metrics, setMetrics] = useState<ClientMetricsResponse>(
    {
      totalClients: 0,
      activeClient: 0,
      emailService: 0,
      sftpService: 0,
    }
  )

  const fetchClients = useCallback(async (currentPage: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await clientService.getPaginated(currentPage, PAGE_SIZE)
      const newCliente: ICliente[] = Array.isArray(response) ? response : response.data
      setHasMore(response.hasNextPage)
      setClients((prev) => currentPage === 1 ? newCliente : [...prev, ...newCliente])

    } catch (error) {
      setError('Failed to load clientes')
    } finally {
      setLoading(false)
    }
  }, [])



  const getClientList = async (): Promise<ClientOption[]> => {
    try {
      const data = await clientService.getAll();
      const clienteName = data.map((c: any) => ({
        name: c.name,
        id: c.id,
      }));

      setClientsName(clienteName);

      return clienteName
    } catch (error) {
      console.error("Error getting client names:", error)
      throw error;
    }
  }

  useEffect(() => {
    getClientList();
  }, []);
  const fetchClientsMetrics = async () => {
    try {
      const data = await clientService.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError("Error al cargar datos");
    }
  };



  useEffect(() => {
    fetchClientsMetrics();
  }, []);


  useEffect(() => {
    fetchClients(1);
  }, [fetchClients]);

  const fetchNextPage = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchClients(nextPage);
        return nextPage;
      });
    }
  }, [loading, hasMore, fetchClients]);

  const addClient = async (newClientData: ICliente): Promise<ICliente> => {
    try {
      const createClient = await clientService.insert(newClientData)

      setClients((prev) => [createClient, ...prev])
      await fetchClientsMetrics();
      return createClient;
    } catch (err) {
      console.error("Error creating client:", err)
      throw err;

    }

  }

  const updateClient = async (id: number, updatedData: ICliente) => {
    try {
      const updated = await clientService.update(id, updatedData)
      setClients((prev) =>
        prev.map((c) => (c.id === id ? updated : c)));
      await fetchClientsMetrics();
      return updated
    } catch (error) {
      console.error("Error updating client:", error)
    }
  }

  const deleteCliente = async (id: number) => {
    try {
      const clientDelete = await clientService.delete(id)

      setClients((prev) => prev.filter((c) => (c.id !== clientDelete.id)))
      await fetchClientsMetrics();
      return clientDelete
    } catch (error) {
      console.error("Error updating client:", error)
    }

  }




  return {
    clients,
    loading,
    error,
    hasMore,
    fetchNextPage,
    addClient,
    updateClient,
    deleteCliente,
    metrics,
    clientsName
  } as const;
}