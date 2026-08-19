import { useState } from "react";
import { ICliente } from "../types/Cliente";
import { CLIENT } from "../mocks/ClientMock";

export function useClients() {
  const [clients, setClients] = useState<ICliente[]>(CLIENT);

  const addClient = (newClientData: Partial<ICliente>) => {
    const client: ICliente = {
      id: newClientData.id || 0,
      name: newClientData.name || "",
      telefono: newClientData.telefono || "",
      email: newClientData.email || [],
      estatus: true,
      sftService: false,
      emailService: (newClientData.email?.length || 0) > 0,
    };
    setClients((prev) => [client, ...prev]);
  };

  const updateClient = (id: number, updatedData: Partial<ICliente>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
  };

  return { clients, addClient, updateClient };
}