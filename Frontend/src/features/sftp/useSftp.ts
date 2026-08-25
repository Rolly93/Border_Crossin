import { useCallback, useEffect, useState } from "react";
import { ISftpConfiguration } from "../clients/types/Cliente";
import { sftpService } from "./service/sftpService";

export function useSftp() {
  const [sftpConfig, setSftpConfig] = useState<ISftpConfiguration | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const getSftpConfig = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)

      const config = await sftpService.getConnection(id)
      console.log(config);

      setSftpConfig(config)
      return config
    } catch (er: any) {
      setError(er.message);
      setSftpConfig(null)

    } finally {
      setLoading(false)
    }
  }, [])

  const updateSftpConfig = async (sftpConfig: ISftpConfiguration, clientId: number) => {
    try {
      const update = await sftpService.update(clientId, sftpConfig)

      setSftpConfig(update);
      return update
    } catch (error: any) {
      console.error("Error updating SFTP config:", error);
      setError(error.message || "Error updating configuration");
      throw error;
    } finally {
      setLoading(false);
    }
  }


  const createSftpConfig = async (newSftp: ISftpConfiguration): Promise<ISftpConfiguration> => {
    try {
      const createNewSftp = await sftpService.insert(newSftp)

      setSftpConfig(createNewSftp);
      return createNewSftp;
    } catch (err) {
      console.error("Error creating client:", err)
      throw err;

    }

  }

  return {
    sftpConfig,
    getSftpConfig,
    updateSftpConfig,
    createSftpConfig,
    loading,
    error,
  };
}