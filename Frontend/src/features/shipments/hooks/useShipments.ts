/** @format */

import { useState, useEffect, useCallback } from "react";
import { shipmentService } from "@/features/shipments/service/shipmentService";
import { components } from "@/types/api";

export type TShipmentPaginate =
  components["schemas"]["PaginatedShipmentResponse"];

export type TConsolidateRequest = components['schemas']['ConsolidateResponse']
export type TTrailerRequest = components['schemas']['TrailerRequest']

export type TEventCategory = components["schemas"]["EventCategory"];
export type TShipmentEvent = components["schemas"]["ShipmentEvent"];

export type TShipmentRequest =
  | components["schemas"]["ConsolidateRequest"]
  | components["schemas"]["TrailerRequest"];

export type TShipmentResponse =
  | components["schemas"]["ConsolidateResponse"]
  | components["schemas"]["TrailerResponse"];

export type TShipmentUpdate =
  | components["schemas"]["ConsolidateResponse"]
  | components["schemas"]["TrailerResponse"];

export interface IShipmentFormValues extends Omit<TShipmentRequest, "cliente"> {
  cliente: string | number;
}
const PAGE_SIZE = 10;

export function useShipments() {
  const [shipments, setShipments] = useState<TShipmentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const fetchShipments = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.getPaginated(
        currentPage,
        PAGE_SIZE,
      );

      const isArray = Array.isArray(response);

      const newShipments: TShipmentResponse[] = isArray
        ? response
        : response.data;
      const canFetchMore = isArray
        ? newShipments.length === PAGE_SIZE
        : Boolean(response.hasNextPage);

      setHasMore(canFetchMore);
      setShipments((prev) =>
        currentPage === 1 ? newShipments : [...prev, ...newShipments],
      );
    } catch (err) {
      setError("Failed to load shipments");
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

  const updateShipment = async (id: number, shipmentData: TShipmentUpdate) => {
    const updated = await shipmentService.update(id, shipmentData);
    setShipments((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    return updated;
  };

  const deleteShipment = async (id: number) => {
    const result = await shipmentService.delete(id);
    const deletedId = result?.id ?? id;
    setShipments((prev) => prev.filter((item) => item.id !== deletedId));
    return result;
  };

  const addShipment = async (
    newShipment: IShipmentFormValues,
  ): Promise<TShipmentResponse> => {
    //    const payload: TShipmentRequest = {
    //      tracking_number: newShipment.tracking_number,
    //      customer_tracking: newShipment.customer_tracking,
    //      type_operation: newShipment.type_operation,
    //      cliente: Number(newShipment.cliente),
    //      origen: newShipment.origen,
    //      destination: newShipment.destination,
    //      truck: newShipment.truck,
    //      trailer: newShipment.trailer,
    //    };

    const createdShipment = await shipmentService.insert(newShipment);
    setShipments((prev) => [createdShipment, ...prev]);
    return createdShipment;
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
