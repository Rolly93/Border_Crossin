/**
 * Convierte cualquier error (axios, FastAPI 422, Error de servicio) en un texto
 * que se puede mostrar en la interfaz. Nunca devuelve un objeto.
 */
export function getErrorMessage(err: any, fallback = "Ocurrió un error"): string {
  const detail = err?.response?.data?.detail ?? err?.response?.data?.message;

  // Sin respuesta HTTP: el backend no contestó o falló antes de responder (un 500 sin CORS también cae aquí).
  if (err?.request && !err?.response) {
    return "No hay respuesta del backend. Revisa que esté corriendo y mira su consola: si aparece un Traceback, ahí está la causa.";
  }
  if (err?.response && !detail) {
    return `${fallback} (el servidor respondió ${err.response.status})`;
  }

  if (typeof detail === "string" && detail) {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item: any) => {
        if (typeof item === "string") {
          return item;
        }
        const field = Array.isArray(item?.loc) ? item.loc.slice(1).join(".") : "";
        return field ? `${field}: ${item?.msg}` : String(item?.msg ?? fallback);
      })
      .join(", ");
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}

/**
 * Error de API con el mensaje general y, si el backend respondió 422, los
 * errores por campo listos para `form.setErrors`.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Convierte el `detail` de un 422 de FastAPI en `{ "campo.ruta": mensaje }`.
 * `loc` viene como ["body", <tag>?, ...campo]; `skipSegments` quita los tags
 * de uniones discriminadas (p. ej. "trailer_53ft", "consolidated").
 */
export function getFieldErrors(
  err: any,
  skipSegments: readonly string[] = [],
): Record<string, string> {
  const detail = err?.response?.data?.detail;
  if (!Array.isArray(detail)) {
    return {};
  }

  const errors: Record<string, string> = {};
  for (const item of detail) {
    if (!Array.isArray(item?.loc)) {
      continue;
    }
    const path = item.loc
      .filter((seg: unknown, i: number) => !(i === 0 && seg === "body"))
      .filter((seg: unknown) => !skipSegments.includes(String(seg)))
      .join(".");
    if (path && !errors[path]) {
      errors[path] = String(item?.msg ?? "Valor inválido");
    }
  }
  return errors;
}

export function toApiError(
  err: any,
  fallback: string,
  skipSegments: readonly string[] = [],
): ApiError {
  return new ApiError(
    getErrorMessage(err, fallback),
    getFieldErrors(err, skipSegments),
    err?.response?.status,
  );
}
