import { useEffect, useState } from "react";
import { getErrorMessage } from "@/components/utils/errorMessage";
import { unitService } from "../service/ApiUnitService";
import { IUnitAssignment } from "../type/unit.interface";

/** Carga el historial de asignaciones cuando hay una unidad seleccionada. */
export function useUnitHistory(unitId: number | null) {
  const [history, setHistory] = useState<IUnitAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (unitId === null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    unitService
      .history(unitId)
      .then((rows) => { if (!cancelled) setHistory(rows); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err, "No se pudo cargar el historial")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [unitId]);

  return { history, loading, error } as const;
}
