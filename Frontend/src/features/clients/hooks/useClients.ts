import { useCallback, useEffect, useState } from "react";
import { ICliente } from "../types/Cliente";
import { clientService } from "../service/clientService";
import { ClientMetricsResponse } from "../types/IClientService";
import { usePaginatedList } from "@/components/hook/usePaginaterList";

interface ClientOption {
  id: number;
  name: string;
}
export function useClients() {

  const fetchFn = useCallback((page: number, size: number) => clientService.getPaginated(page, size), []
  )

  const {
    data: clients,
    setData: setClients, hasMore,
    loading,
    error,
    setError,
    fetchNextPage, setLoading

  } = usePaginatedList<ICliente>(fetchFn);


  const [clientsName, setClientsName] = useState<ClientOption[]>([]);
  const [metrics, setMetrics] = useState<ClientMetricsResponse>(
    {
      totalClients: 0,
      activeClient: 0,
      emailService: 0,
      sftpService: 0,
    }
  )



  const getClientList = async (): Promise<ClientOption[] | null> => {
    try {
      const data = await clientService.getAll();
      const safeData = Array.isArray(data) ? data : (data as any)?.clients || [];
      const clienteName = safeData.map((c: any) => ({
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
      console.log(data);

      setMetrics(data);
    } catch (err) {

      setError("Error al cargar datos");
      throw err
    }
  };



  useEffect(() => {
    fetchClientsMetrics();
  }, []);




  const addClient = async (newClientData: ICliente): Promise<ICliente> => {
    try {
      console.log(newClientData);

      const createClient = await clientService.insert(newClientData)

      setClients((prev) => [createClient, ...prev])
      await fetchClientsMetrics();
      return createClient;
    } catch (err: any) {
      console.error("Error creating client:", err)
      setError(err.message)
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
    } catch (error: any) {
      console.error("Error updating client:", error.message)
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
    deleteCliente, setError,
    metrics,
    clientsName
  } as const;
}