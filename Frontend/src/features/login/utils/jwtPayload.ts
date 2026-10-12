export interface JwtClaims {
  sub?: string;
  is_admin?: boolean;
  [key: string]: unknown;
}

/**
 * Lee los claims del JWT sin verificar la firma.
 * Sirve solo para decidir qué mostrar en la interfaz: el backend siempre valida.
 */
export function decodeJwtPayload(token: string | null): JwtClaims | null {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as JwtClaims;
  } catch {
    return null;
  }
}
