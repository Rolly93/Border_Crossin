import { useState, useEffect, useCallback } from "react";
import { Shipment } from "@/types/Shipment";
import { shipmentService } from "@/features/shipments/service/shipmentService";

const PAGE_SIZE = 10;

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const fetchShipments = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.getPaginated(currentPage, PAGE_SIZE);

      const isArray = Array.isArray(response);
      const newShipments: Shipment[] = isArray ? response : response.data;
      const canFetchMore = isArray
        ? newShipments.length === PAGE_SIZE
        : Boolean(response.hasNextPage);

      setHasMore(canFetchMore);
      setShipments((prev) =>
        currentPage === 1 ? newShipments : [...prev, ...newShipments]
      );
    } catch (err) {
      setError("Failed to load shipments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments(1);
  }, [fetchShipments]);

  const fetchNextPage = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchShipments(nextPage);
    }
  }, [loading, hasMore, page, fetchShipments]);

  const updateShipment = async (id: number, shipmentData: Shipment) => {
    try {
      const updated = await shipmentService.update(id, shipmentData);
      setShipments((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err) {
      console.error("Error updating shipment:", err);
      throw err;
    }
  };

  const deleteShipment = async (id: number) => {
    try {
      const result = await shipmentService.delete(id);
      const deletedId = result?.id ?? id;
      setShipments((prev) => prev.filter((item) => item.id !== deletedId));
      return result;
    } catch (err) {
      console.error("Error deleting shipment:", err);
      throw err;
    }
  };

  const addShipment = async (newShipment: Shipment): Promise<Shipment> => {
    try {
      const createdShipment = await shipmentService.insert(newShipment);
      setShipments((prev) => [createdShipment, ...prev]);
      return createdShipment;
    } catch (err) {
      console.error("Error creating new shipment:", err);
      throw err;
    }
  };

  return {
    shipments,
    loading,
    error,
    hasMore,
    page,
    fetchNextPage,
    fetchShipments,
    addShipment,
    updateShipment,
    deleteShipment,
  } as const;
}