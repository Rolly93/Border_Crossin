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
