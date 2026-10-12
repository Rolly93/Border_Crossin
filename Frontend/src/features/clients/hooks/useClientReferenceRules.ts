import { useCallback } from "react";
import { clientService } from "../service/clientService";

export function useClientReferenceRules() {
  const getRules = useCallback((clientId: number) => clientService.getReferenceRules(clientId), []);
  return { getRules } as const;
}
