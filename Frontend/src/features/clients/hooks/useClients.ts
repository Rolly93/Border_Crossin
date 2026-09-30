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

  const fetchFn = useCallback((page: number, size: number) => clientService.getPaginated(page, size), [])

  const {
    data: clients,
    setData: setClients, hasMore,
    loading,
    error,
    setError, fetchPage,
    fetchNextPage, setLoading

  } = usePaginatedList<ICliente>(fetchFn);


  const [clientsName, setClientsName] = useState<ClientOption[]>([]);
  const [metrics, setMetrics] = useState<ClientMetricsResponse>(
    {
      totalClients: 0,
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
    } catch (error: any) {
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
    } catch (error: any) {

      setError(`Error al cargar datos ${error.message}`);
      throw error
    }
  };



  useEffect(() => {
    fetchClientsMetrics();
  }, []);




  const addClient = async (newClientData: ICliente): Promise<ICliente> => {
    try {

      const createClient = await clientService.insert(newClientData)
      await fetchPage(1);
      await fetchClientsMetrics();
      return createClient;
    } catch (error: any) {
      console.error("Error creating client:", error)
      setError(error.message)
      throw error;

    }

  }



  const updateClient = async (id: number, updatedData: ICliente) => {
    try {
      const updated = await clientService.update(id, updatedData);
      await fetchPage(1);

      await fetchClientsMetrics();
      return updated;
    } catch (error: any) {
      console.error("Error updating client:", error);
      setError(error.message);
      throw error;
    }
  };
  const deleteCliente = async (id: number) => {
    try {
      const clientDelete = await clientService.delete(id)
      await fetchPage(1);
      await fetchClientsMetrics();
      return clientDelete
    } catch (error: any) {
      console.error("Error updating client:", error)
      setError(error.message)
      throw error
    }

  }

  const reActiveCliente
    = async (id: number) => {
      try {
        const clientDelete = await clientService.active(id)
        await fetchPage(1);
        await fetchClientsMetrics();
        return clientDelete
      } catch (error: any) {
        console.error("Error updating client:", error)
        setError(error.message)
        throw error
      }

    }



  return {
    clients,
    loading,
    error,
    hasMore,
    fetchNextPage, fetchPage,
    addClient,
    updateClient,
    deleteCliente, setError,
    metrics, reActiveCliente,
    clientsName
  } as const;
}