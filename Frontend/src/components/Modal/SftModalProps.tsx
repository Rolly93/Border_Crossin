/** @format */

import {
  Alert,
  Code,
  Divider,
  Drawer,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ISftpTestResult } from "@/features/sftp/types/ISftpSend";
import { useForm } from "@mantine/form";
import { AtomTextInput } from "../atoms/AtomTextInput";
import { useSftp } from "@/features/sftp/hooks/useSftp";
import { useEffect, useState } from "react";
import { ISftpConfiguration } from "@/features/clients/types/Cliente";
import { AtomButton } from "../atoms/AtomButton";
import { getErrorMessage } from "../utils/errorMessage";
import { useAuth } from "@/features/login/context/AuthContext";

interface IsftModalProps {
  opened: boolean;
  onClose: () => void;
  clientId: number | undefined;
}

export type SftpFormValues = {
  username: string;
  password: string;
  port: string;
  host: string;
  root_folder: string;
  remote_folder: string;
};

interface SftpFromsProps {
  initialData: Partial<ISftpConfiguration>;
  onSubmit: (values: SftpFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  canEdit: boolean;
}

const DEFAULT_SFTP_CONFIG: Partial<ISftpConfiguration> = {
  username: "",
  password: "",
  port: undefined,
  host: "",
  root_folder: "",
  remote_folder: "",
};

export default function SftModal({
  opened,
  onClose,
  clientId,
}: IsftModalProps) {
  // Alta, cambios y baja son solo de administrador; el CSR solo consulta.
  const { isAdmin } = useAuth();
  const {
    sftpConfig,
    getSftpConfig,
    error,
    loading,
    updateSftpConfig,
    createSftpConfig,
    deleteSftpConfig,
    testSftpConfig,
  } = useSftp();
  const [localError, setLocalError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ISftpTestResult | null>(null);

  useEffect(() => {
    if (opened && clientId !== undefined) {
      setLocalError(null);
      setTestResult(null);
      getSftpConfig(clientId);
    }
  }, [opened, clientId, getSftpConfig]);

  const isInactive = sftpConfig?.is_active === false;
  const canTest = isAdmin && Boolean(sftpConfig?.id) && !isInactive;

  const handleTest = async () => {
    if (!sftpConfig?.id) {
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await testSftpConfig(sftpConfig));
    } catch (err) {
      setTestResult({
        ok: false,
        message: getErrorMessage(err, "No se pudo probar la conexión"),
        fingerprint: null,
      });
    } finally {
      setTesting(false);
    }
  };

  const handelDelete = async () => {
    if (!sftpConfig?.id) {
      return;
    }
    if (!window.confirm("¿Desactivar la configuración SFTP de este cliente?")) {
      return;
    }
    try {
      await deleteSftpConfig(sftpConfig.id);
      onClose();
    } catch (err: any) {
      setLocalError(getErrorMessage(err, "No se pudo eliminar"));
    }
  };

  const handelSubmit = async (values: SftpFormValues) => {
    const payload: ISftpConfiguration = {
      id: sftpConfig?.id || undefined,
      idClient: Number(clientId),
      host: values.host.trim(),
      port: Number(values.port),
      username: values.username.trim(),
      password: values.password,
      root_folder: values.root_folder.trim(),
      remote_folder: values.remote_folder.trim(),
    };
    try {
      const saved = sftpConfig?.id
        ? await updateSftpConfig(payload)
        : await createSftpConfig(payload);
      if (!saved.host_key_fingerprint) {
        // Sin verificar no se envía nada: se deja abierto para probar la conexión.
        setTestResult({
          ok: true,
          message: "Guardado. Ahora usa 'Probar conexión' para habilitar los envíos.",
          fingerprint: null,
        });
        return;
      }
      onClose();
    } catch (err: any) {
      setLocalError(getErrorMessage(err, "No se pudo guardar"));
    }
  };

  return (
    <Drawer offset={8} radius="md" opened={opened} onClose={onClose}>
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />

      {(error || localError) && (
        <div style={{ color: "red", marginBottom: 12 }}>
          {localError || error}
        </div>
      )}

      {!loading && isInactive && (
        <Alert color="yellow" mb="md" title="Configuración desactivada">
          Se conservan los datos anteriores. Guardar la reactivará; deja la
          contraseña vacía para conservar la actual.
        </Alert>
      )}

      {!loading && (
        <SftpForm
          key={`${clientId}-${sftpConfig?.id || "empty"}-${sftpConfig?.is_active}`}
          initialData={sftpConfig || DEFAULT_SFTP_CONFIG}
          onSubmit={handelSubmit}
          onDelete={isInactive ? undefined : handelDelete}
          canEdit={isAdmin}
        />
      )}

      {!loading && canTest && (
        <Stack gap="xs" mt="xl">
          <Divider label="Verificación del servidor" labelPosition="left" />
          <Text size="sm" c="dimmed">
            {sftpConfig?.host_key_fingerprint ? (
              <>
                Llave del servidor verificada: <Code>{sftpConfig.host_key_fingerprint}</Code>
              </>
            ) : (
              "Aún no se ha probado la conexión. Los envíos no saldrán hasta que se pruebe con éxito."
            )}
          </Text>
          <Group>
            <AtomButton variant="light" onClick={handleTest} loading={testing}>
              Probar conexión
            </AtomButton>
          </Group>
          {testResult && (
            <Alert color={testResult.ok ? "green" : "red"}>{testResult.message}</Alert>
          )}
        </Stack>
      )}
    </Drawer>
  );
}

function SftpForm({
  initialData,
  onSubmit,
  onDelete,
  canEdit,
}: SftpFromsProps) {
  const isEditMode = Boolean(initialData?.id);
  const form = useForm<SftpFormValues>({
    mode: "uncontrolled",
    initialValues: {
      username: initialData.username || "",
      password: "",
      port: initialData.port ? String(initialData.port) : "",
      host: initialData.host || "",
      root_folder: initialData.root_folder || "",
      remote_folder: initialData.remote_folder || "",
    },
    validate: {
      username: (v) => (v.trim() ? null : "Usuario requerido"),
      password: (v) => (!isEditMode && !v ? "Contraseña requerida" : null),
      port: (v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1 && n <= 65535
          ? null
          : "Puerto debe ser un número entre 1 y 65535";
      },
      host: (v) => {
        if (!v.trim()) {
          return "Host requerido";
        }
        if (/\s/.test(v) || v.includes("://") || v.includes("/")) {
          return "Solo el nombre o IP del servidor (sin http:// ni rutas)";
        }
        return null;
      },
      root_folder: (v) => (v.trim() ? null : "Carpeta local requerida"),
      remote_folder: (v) => (v.trim() ? null : "Carpeta remota requerida"),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        onSubmit(values);
      })}
      noValidate>
      <Stack gap="xl">
        <Title order={2}>SFTP Configuration</Title>
        {!canEdit && (
          <Text size="sm" c="dimmed">
            Solo lectura. Los cambios los realiza un administrador.
          </Text>
        )}
        <fieldset
          disabled={!canEdit}
          style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          <Stack gap="xl">
            <AtomTextInput
              label="Usuario"
              placeholder="usuario SFTP"
              required
              {...form.getInputProps("username")}
            />
            <AtomTextInput
              label="Contraseña"
              placeholder={
                isEditMode
                  ? "Dejar vacía para conservar la actual"
                  : "contraseña SFTP"
              }
              type="password"
              required={!isEditMode}
              {...form.getInputProps("password")}
            />
            <AtomTextInput
              label="Puerto"
              placeholder="22"
              required
              {...form.getInputProps("port")}
            />
            <AtomTextInput
              label="Host"
              placeholder="sftp.ejemplo.com"
              required
              {...form.getInputProps("host")}
            />
            <AtomTextInput
              label="Carpeta local (XML de respaldo)"
              placeholder="C:/xml/cliente"
              required
              {...form.getInputProps("root_folder")}
            />
            <AtomTextInput
              label="Carpeta remota (destino SFTP)"
              placeholder="/upload"
              required
              {...form.getInputProps("remote_folder")}
            />
            {canEdit && (
              <Group justify="flex-end" mt="xl">
                {isEditMode ? (
                  <AtomButton variant="outline" color="red" onClick={onDelete}>
                    Eliminar
                  </AtomButton>
                ) : (
                  <div />
                )}

                <AtomButton type="submit" color="teal">
                  GUARDAR
                </AtomButton>
              </Group>
            )}
          </Stack>
        </fieldset>
      </Stack>
    </form>
  );
}
