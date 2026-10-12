/**
 * Convierte cualquier error (axios, FastAPI 422, Error de servicio) en un texto
 * que se puede mostrar en la interfaz. Nunca devuelve un objeto.
 */
export function getErrorMessage(err: any, fallback = "Ocurrió un error"): string {
  const detail = err?.response?.data?.detail ?? err?.response?.data?.message;

  if (typeof detail === "string" && detail) return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item: any) => {
        if (typeof item === "string") return item;
        const field = Array.isArray(item?.loc) ? item.loc.slice(1).join(".") : "";
        return field ? `${field}: ${item?.msg}` : String(item?.msg ?? fallback);
      })
      .join(", ");
  }

  if (err instanceof Error && err.message) return err.message;

  return fallback;
}
