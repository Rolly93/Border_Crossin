import { useEffect, useState } from "react";
import { ICliente } from "../types/Cliente";
import { CLIENT } from "../mocks/ClientMock";
import { clientService } from "../service/clientService";

export function useClients() {
  const [clients, setClients] = useState<ICliente[]>(CLIENT);
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function fetchClients() {
      try {
        setLoading(true)

        const data = await clientService.getAll();
        if (isMounted) setClients(data)
      } catch (error) {
        if (isMounted) setError("Failed to load clients")

      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchClients()
    return () => { isMounted = false; }
  }, [])

  const addClient = async (newClientData: ICliente) => {
    try {
      const creatClient = await clientService.insert(newClientData)

      setClients((prev) => [creatClient, ...prev])
      return creatClient;
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
      return updated
    } catch (error) {
      console.error("Error updating client:", error)
    }
  }




  return { clients, addClient, updateClient, loading, error };
}