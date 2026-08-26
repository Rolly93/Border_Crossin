import { useState, useEffect } from "react";
import { Shipment } from "@/features/shipments/types/Shipment";
import { shipmentService } from "@/features/shipments/service/shipmentService";

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getAll();
      console.log(data)
      setShipments(data);
    } catch (err) {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const addLocalShipment = (newShipment: Shipment) => {
    setShipments((prev) => [...prev, newShipment]);
  };

  const updateLocalShipment = (id: number, updatedData: Shipment) => {
    setShipments(prev => prev.map(item => item.id === id ? { ...updatedData } : item));
  };

  return { shipments, loading, error, updateLocalShipment, refresh: fetchShipments, addLocalShipment };
}

export function usesUpdateShipment() {
  const [success, setSuccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateShipment = async (id: number, updatedData: Shipment) => {
    try {
      setError(null)
      setLoading(true)
      setSuccess(false)

      await shipmentService.update(id, updatedData);

      setSuccess(true)
    } catch (error) {
      console.log('Error al actualizar el embarque', error);
      setError("No se pudo guardar la información en el servidor.");
    } finally {
      setLoading(false)
    }
  }
  return { updateShipment, loading, error, success }

}