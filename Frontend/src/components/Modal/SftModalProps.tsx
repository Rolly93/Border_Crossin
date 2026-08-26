import { Button, Drawer, Group, LoadingOverlay, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { AtomTextInput } from "../atoms/AtomTextInput";
import { useSftp } from "@/features/sftp/useSftp";
import { useEffect } from "react";
import { ISftpConfiguration } from "@/features/clients/types/Cliente";
import { AtomButton } from "../atoms/AtomButton";

interface IsftModalProps {
    opened: boolean;
    onClose: () => void;
    clientId: number | undefined
}
export type SftpFormValues = {
    username: string;
    password: string;
    port: string;
    host: string;
};

interface SftpFromsProps {
    initialData: Partial<ISftpConfiguration>;
    clientId?: number;
    onSaveSuccess?: () => void;
    onSubmit: (values: SftpFormValues) => Promise<void> | void;
    onDelete?: () => Promise<void> | void;
}
const DEFAULT_SFTP_CONFIG: Partial<ISftpConfiguration> = {
    username: "",
    password: "",
    port: undefined,
    host: "",
};

export default function SftModal({ opened, onClose, clientId }: IsftModalProps) {
    const { sftpConfig, getSftpConfig, error, loading, updateSftpConfig, createSftpConfig } = useSftp()
    const { t, i18n } = useTranslation()


    useEffect(() => {
        if (opened && clientId !== undefined) {
            getSftpConfig(clientId);
        }
    }, [opened, clientId, getSftpConfig]);

    const handelDelete = async () => {

    }
    const handelSubmit = async (values: SftpFormValues) => {
        const sftpPayload = {
            username: values.username,
            password: values.password,
            port: Number(values.port),
            host: values.host,
            id: sftpConfig?.id || undefined,
            idClient: Number(clientId)

        }
        if (sftpConfig?.id) {
            await updateSftpConfig(sftpPayload)
        } else {
            await createSftpConfig(sftpPayload)
        }
        onClose()
    }




    return (
        <Drawer offset={8} radius="md" opened={opened} onClose={onClose} >

            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

            {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

            {!loading && (
                <SftpForm
                    key={`${clientId}-${sftpConfig?.id || "empty"}`}
                    initialData={sftpConfig || DEFAULT_SFTP_CONFIG}
                    onSubmit={handelSubmit}
                    onDelete={handelDelete}
                />
            )}
        </Drawer>)
}



function SftpForm({ initialData, onSubmit, onDelete }: SftpFromsProps) {
    const { t } = useTranslation();
    const isEditMode = Boolean(initialData?.id);
    const form = useForm<SftpFormValues>({
        mode: "uncontrolled",
        initialValues: {
            username: initialData.username || "",
            password: initialData.password || "",
            port: initialData.port ? String(initialData.port) : "",
            host: initialData.host || "",
        },
    });

    return (
        <form onSubmit={form.onSubmit((values) => { onSubmit(values) })}>
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
                    {isEditMode ? (
                        <AtomButton variant="outline" color='red' onClick={onDelete} >
                            Eliminar
                        </AtomButton>
                    ) : (
                        <div />
                    )}

                    <AtomButton type={'submit'} color='teal'  >
                        GUARDAR
                    </AtomButton>
                </Group>
            </Stack>
        </form>
    );
}