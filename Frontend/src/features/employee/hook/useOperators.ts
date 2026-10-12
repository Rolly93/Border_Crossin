import { useEffect, useState } from "react";
import { getErrorMessage } from "@/components/utils/errorMessage";
import { employeeService } from "../service/EmployeeService";
import { IOperatorOption } from "../type/employee.interface";

/** Operadores activos, para elegir a quién se liga una unidad. */
export function useOperators(enabled: boolean) {
  const [operators, setOperators] = useState<IOperatorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    employeeService
      .getOperators()
      .then((rows) => { if (!cancelled) setOperators(rows); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err, "No se pudieron cargar los operadores")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [enabled]);

  return { operators, loading, error } as const;
}
