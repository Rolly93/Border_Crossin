import { Button, Modal, Stack, Text, TextInput } from "@mantine/core";
import { useState } from "react";

interface ScacSetupModalProps {
  opened: boolean;
  onSave: (scac: string) => Promise<void>;
}

export function ScacSetupModal({ opened, onSave }: ScacSetupModalProps) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const scac = value.trim().toUpperCase();
    if (!/^[A-Z]{2,4}$/.test(scac)) {
      setError("El SCAC debe tener de 2 a 4 letras");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(scac);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "No se pudo guardar el SCAC");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      title="Configuración inicial"
      centered
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack>
        <Text size="sm">
          Escribe el SCAC del sistema. Se guardará por defecto y no se volverá a pedir.
        </Text>
        <TextInput
          label="SCAC"
          placeholder="Ej. GALA"
          value={value}
          maxLength={4}
          required
          error={error ?? undefined}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
        <Button color="teal" onClick={handleSave} loading={saving}>
          Guardar SCAC
        </Button>
      </Stack>
    </Modal>
  );
}
