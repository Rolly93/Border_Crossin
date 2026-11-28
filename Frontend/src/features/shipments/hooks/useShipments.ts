/** @format */

import { useState, useEffect, useCallback } from "react";
import { shipmentService } from "@/features/shipments/service/shipmentService";
import { components } from "@/types/api";

export type TShipmentPaginate =
  components["schemas"]["PaginatedShipmentResponse"];

export type TConsolidateRequest = components["schemas"]["ConsolidateRequest"];
export type TTrailerRequest = components["schemas"]["TrailerRequest"];

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

export type TConsolidateGuideItemRequest =
  components["schemas"]["ConsolidateGuideItem"];

export type TConsolidateGuideItemResponse =
  components["schemas"]["ConsolidateGuideItemResponse"];

export type TShipmentFormVaules = TShipmentResponse & {
  trailer_number?: string;
  plates?: string;
  state?: string;
  seal?: string;
  guide_number?: string;
  pices?: number;
  weight?: number;
  service_type?: string;
};
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
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los embarques",
      );
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

  // PUT /shipment/{id}/update responde {status, data:{id,...}}, no el embarque,
  // así que la fila se actualiza con los valores enviados.
  const updateShipment = async (id: number, shipmentData: TShipmentUpdate) => {
    await shipmentService.update(id, shipmentData);
    setShipments((prev) =>
      prev.map((item) => (item.id === id ? shipmentData : item)),
    );
    return shipmentData;
  };

  const deleteShipment = async (id: number) => {
    const result = await shipmentService.delete(id);
    const deletedId = result?.id ?? id;
    setShipments((prev) => prev.filter((item) => item.id !== deletedId));
    return result;
  };

  // POST /shipment/create no devuelve el embarque (cuerpo null): se recarga
  // la primera página en lugar de insertar la respuesta en la lista.
  const addShipment = async (newShipment: TShipmentRequest): Promise<void> => {
    await shipmentService.insert(newShipment);
    setPage(1);
    await fetchShipments(1);
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
