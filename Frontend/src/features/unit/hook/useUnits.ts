/** @format */

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/components/utils/errorMessage";
import { unitService } from "../service/ApiUnitService";
import { IUnit, IUnitInput, IUnitResponse } from "../type/unit.interface";
import { AxiosError } from "axios";
import { components } from "@/types/api";

/**
 * Estado de la lista de unidades y sus acciones.
 * Cada acción recarga la lista al terminar y devuelve true/false para que la UI cierre o no el modal.
 */

export type TUnitRespose = components['schemas']['UnitOut']
export type TUnitRequest = components['schemas']['UnitIn']
export function useUnits() {
  const [units, setUnits] = useState<TUnitRespose[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setUnits(await unitService.list());
      setError(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      const status = axiosError.response?.status;
      if (status === 404 || status === 204) {
        setUnits([]);
        setError(null);
      } else {
        setError(getErrorMessage(err, "No se pudieron cargar las unidades"));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const run = useCallback(
    async (action: () => Promise<unknown>, fallback: string) => {
      setError(null);
      try {
        await action();
        await refresh();
        return true;
      } catch (err) {
        setError(getErrorMessage(err, fallback));
        return false;
      }
    },
    [refresh],
  );

  const createUnit = (input: TUnitRequest) =>
    run(() => unitService.create(input), "No se pudo crear la unidad");

  const updateUnit = (id: number, input: TUnitRequest) =>
    run(() => unitService.update(id, input), "No se pudo actualizar la unidad");

  const assignDriver = (unitId: TUnitRequest, driverId: number) =>
    run(
      () => unitService.assign(unitId, driverId),
      "No se pudo asignar el operador",
    );

  const releaseDriver = (unitId: number) =>
    run(() => unitService.release(unitId), "No se pudo liberar la unidad");

  return {
    units,
    loading,
    error,
    setError,
    refresh,
    createUnit,
    updateUnit,
    assignDriver,
    releaseDriver,
  } as const;
}
