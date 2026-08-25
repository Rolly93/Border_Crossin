import { Button, Drawer, Group, LoadingOverlay, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { AtomTextInput } from "../atoms/AtomTextInput";
import { useSftp } from "@/features/sftp/useSftp";
import { useEffect } from "react";
import { ISftpConfiguration } from "@/features/clients/types/Cliente";

interface IsftModalProps {
    opened: boolean;
    onClose: () => void;
    clientId: number | undefined
}
const DEFAULT_SFTP_CONFIG: Partial<ISftpConfiguration> = {
    username: "",
    password: "",
    port: undefined,
    host: "",
};

export default function SftModal({ opened, onClose, clientId }: IsftModalProps) {
    const { sftpConfig, getSftpConfig, error, loading } = useSftp()
    const { t, i18n } = useTranslation()


    useEffect(() => {
        if (opened && clientId !== undefined) {
            getSftpConfig(clientId);
        }
    }, [opened, clientId, getSftpConfig]);




    return (
        <Drawer offset={8} radius="md" opened={opened} onClose={onClose} >

            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

            {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

            {!loading && (
                <SftpForm
                    key={`${clientId}-${sftpConfig?.id || "empty"}`}
                    initialData={sftpConfig || DEFAULT_SFTP_CONFIG}
                    onClientId={clientId}
                />
            )}
        </Drawer>)
}

interface SftpFormProps {
    initialData: Partial<ISftpConfiguration>;
    onClientId: number | undefined;
    onSaveSuccess?: () => void;
}

function SftpForm({ initialData, onClientId, onSaveSuccess }: SftpFormProps) {
    const { t } = useTranslation();
    const isEditing = Boolean(initialData.id)
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            username: initialData.username || "",
            password: initialData.password || "",
            port: initialData.port ? String(initialData.port) : "",
            host: initialData.host || "",
        },
    });
    const handelSubmit = async (values: typeof form.values) => {
        if (isEditing && !form.isDirty()) {
            console.log("No changes detected");

        }
        const payload = {
            username: values.username,
            password: values.password,
            port: Number(values.port),
            host: values.host,
            idClient: onClientId,
        }

    }


    return (
        <form onSubmit={form.onSubmit((values) => { onsubmit as any })}>
            <Stack gap={'xl'} >
                <Title order={2}>SFTP Configuration</Title>
                <AtomTextInput
                    label={t('modal.labels.username')}
                    placeholder={t('modal.placeholders.username')}
                    required
                    {...form.getInputProps('username')} />
                <AtomTextInput
                    label={t('modal.labels.password')}
                    placeholder={t('modal.placeholders.password')}
                    required
                    {...form.getInputProps('password')} />
                <AtomTextInput
                    label={t('modal.labels.port')}
                    placeholder={t('modal.placeholders.port')}
                    required
                    {...form.getInputProps('port')} />
                <AtomTextInput
                    label={t('modal.labels.host')}
                    placeholder={t('modal.placeholders.host')}
                    required
                    {...form.getInputProps('host')}
                />
                <Group justify="flex-end" mt="xl">
                    <Button type="submit" color="dark">
                        GUARDAR
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}