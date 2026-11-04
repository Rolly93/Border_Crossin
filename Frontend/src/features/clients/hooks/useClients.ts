import { useCallback, useEffect, useState } from "react";
import { clientService } from "../service/clientService";
import { ClientMetricsResponse } from "../types/IClientService";
import { usePaginatedList } from "@/components/hook/usePaginaterList";
import { components } from "@/types/api";

export type TClientOption = components['schemas']['ClientNameResponse']
export type TClientResponse = components['schemas']['ClientPaginateData']
export type TClientRequest = components['schemas']['ClientRequest']
export type TClientReferenceRule = components['schemas']['ReferenceRuleOut']
export type TPaginatedClientResponse = components['schemas']['PaginatedClientResponse']
export type TClientMetricsResponse = components['schemas']['MetricsClientResponse']
export function useClients() {

  const fetchFn = useCallback((page: number, size: number) => clientService.getPaginated(page, size), [])

  const {
    data: clients,
    hasMore,
    loading,
    error,
    setError, fetchPage,
    fetchNextPage

  } = usePaginatedList<TClientResponse>(fetchFn);


  const [clientsName, setClientsName] = useState<TClientOption[]>([]);
  const [metrics, setMetrics] = useState<ClientMetricsResponse>(
    {
      totalClients: 0,
      emailService: 0,
      sftpService: 0,
    }
  )



  const getClientList = async (): Promise<TClientOption[] | null> => {
    const data = await clientService.getAll();

    const safeData = Array.isArray(data) ? data : (data as any)?.clients || [];
    const clienteName = safeData.map((c: any) => ({
      name: c.name,
      id: c.id,
    }));

    setClientsName(clienteName);

    return clienteName;
  }

  useEffect(() => {
    getClientList();
  }, []);


  const fetchClientsMetrics = useCallback(async () => {
    try {
      const data = await clientService.getMetrics();
      setMetrics(data);

    } catch (error: any) {

      setError(`Error al cargar datos ${error.message}`);
      throw error
    }
  }, [setError]);



  useEffect(() => {
    fetchClientsMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchClientsMetrics]);




  const addClient = async (newClientData: TClientRequest): Promise<TClientResponse> => {
    try {

      const createClient = await clientService.insert(newClientData)
      await fetchPage(1);
      await fetchClientsMetrics();
      return createClient;
    } catch (error: any) {
      setError(error.message)
      throw error;
    }

  }



  const updateClient = async (id: number, updatedData: TClientRequest) => {
    try {
      const updated = await clientService.update(id, updatedData);
      await fetchPage(1);

      await fetchClientsMetrics();
      return updated;
    } catch (error: any) {
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