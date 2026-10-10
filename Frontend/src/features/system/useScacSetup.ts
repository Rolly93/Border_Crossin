import { useCallback, useEffect, useState } from "react";
import { systemConfigService } from "./systemConfigService";

export function useScacSetup() {
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    let active = true;
    systemConfigService
      .getScac()
      .then((scac) => {
        if (active) setNeedsSetup(!scac);
      })
      .catch(() => {
        // Si no se puede consultar, no bloqueamos la aplicación.
        if (active) setNeedsSetup(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveScac = useCallback(async (scac: string) => {
    await systemConfigService.setScac(scac);
    setNeedsSetup(false);
  }, []);

  return { needsSetup, saveScac };
}
