import { useCallback, useState } from "react";
import { ISftpConfiguration } from "@/features/clients/types/Cliente";
import { sftpService } from "../service/sftpService";


export function useSftp() {
  const [sftpConfig, setSftpConfig] = useState<ISftpConfiguration | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const getSftpConfig = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)

      const config = await sftpService.getConnection(id)

      setSftpConfig(config)
      return config
    } catch (er: any) {
      setError(er.message);
      setSftpConfig(null)

    } finally {
      setLoading(false)
    }
  }, [])

  const updateSftpConfig = async (sftpConfig: ISftpConfiguration) => {
    const stfpId = sftpConfig.id!
    try {
      const update = await sftpService.update(stfpId, sftpConfig)

      setSftpConfig(update);
      return update
    } catch (error: any) {
      setError(error.message || "Error updating configuration");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const createSftpConfig = async (newSftp: ISftpConfiguration): Promise<ISftpConfiguration> => {
    const createNewSftp = await sftpService.insert(newSftp)

    setSftpConfig(createNewSftp);
    return createNewSftp;
  }

  const deleteSftpConfig = async (id: number): Promise<void> => {
    await sftpService.delete(id)
    setSftpConfig(null)
  }

  return {
    sftpConfig,
    getSftpConfig,
    updateSftpConfig,
    createSftpConfig,
    deleteSftpConfig,
    loading,
    error,
  };
}
