import { ICliente } from "@/features/clients/types/Cliente";
import { Modal, TextInput, Stack, Group, ScrollArea, Avatar, Text, SimpleGrid } from "@mantine/core";
import { useForm, isEmail } from "@mantine/form";
import { useEffect, useState } from "react";
import { IconFileText, IconMail, IconPlus, IconX } from "@tabler/icons-react";
import ActionCard from "../../../components/ui/ActionCard";
import SftModal from "../../../components/Modal/SftModalProps";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { AtomButton } from "@/components/atoms/AtomButton";
import { AtmoAction } from "@/components/atoms/AtomActionIcon";

interface ClienteModalProps {
    onSelectClient: ICliente | null;
    opened: boolean;
    onClose: () => void;
    onSave: (data: any) => void
}

export default function ClientModalProps({ onSelectClient, opened, onClose, onSave }: ClienteModalProps) {
    const [sftpOpened, { open: openSftp, close: closeSftp }] = useDisclosure(false);
    const [newEmail, setNewEmail] = useState("");
    const [recipients, setRecipients] = useState<string[]>([]);
    const [emailError, setEmailError] = useState<string | null>(null);
    const clientId = onSelectClient?.id
    const [service, setService] = useState({
        email: onSelectClient?.emailService,
        sftp: onSelectClient?.sftService,
    });

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            companyName: '',
            mainContact: '',
            phoneNumber: ''
        }
    });

    useEffect(() => {
        if (!opened) { return; }

        setNewEmail('');
        setEmailError(null);

        if (onSelectClient) {
            form.setValues({
                companyName: onSelectClient.name || '',
                phoneNumber: onSelectClient.telefono || ''
            });
            const rawEmail = onSelectClient.email
            const loadedEmails = Array.isArray(rawEmail)
                ? rawEmail
                : rawEmail
                    ? [rawEmail]
                    : [];

            setRecipients(loadedEmails);
            setService({
                email: Boolean(onSelectClient.emailService),
                sftp: Boolean(onSelectClient.sftService)
            });
        }

        else {
            form.reset()
            setRecipients([]);
            setService({ email: false, sftp: false });
        }


    }, [onSelectClient, opened]);



    const handleAddRecipient = () => {
        const validationError = isEmail('Invalid email')(newEmail);

        if (validationError) {
            setEmailError(typeof validationError === 'string' ? validationError : 'Invalid email');
            return;
        }

        if (recipients.includes(newEmail.trim())) {
            setEmailError("Este correo ya está agregado");
            return;
        }

        if (newEmail.trim()) {
            setRecipients([...recipients, newEmail.trim()]);
            setNewEmail("");
            setEmailError(null);
        }
    };

    const handleRemoveRecipient = (emailToRemove: string) => {
        setRecipients(recipients.filter(email => email !== emailToRemove));
    };

    const handleSubmit = (values: typeof form.values) => {
        if (values.companyName) {
            const finalData = {
                ...values,
                email: recipients,
                sftService: service.sftp,
                emailService: service.email
            };
            onSave(finalData)
        }
        onClose();
        return;
    };


    const toggleService = (key: keyof typeof service) => {
        setService((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));

    };

    function handelModal() {
        if (service.sftp && onSelectClient?.id) { openSftp() }

        else if (service.sftp && !onSelectClient?.id) {
            notifications.show({
                title: "Cliente no registrado",
                message: "Debes de guardar primero la informacion del cliente antes de configurar la conezion SFTP",
                color: 'warning'
            })
        }
    }

    return (
        <>

            <Modal opened={opened} onClose={onClose} title={onSelectClient ? "Editar Cliente" : "Nuevo Cliente"} size="lg">
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 2 }} spacing={'md'}>

                    <ActionCard
                        title="SFT Service"
                        icon={<IconFileText size={20} />}
                        color="grape"
                        statusText={service.sftp ? "Activo" : "Inactivo"}
                        onHandelModal={handelModal}
                        onToggle={() => { toggleService('sftp'); }}
                        checked={service.sftp}
                    />
                    <ActionCard
                        title="Email Notification"
                        icon={<IconMail size={20} />}
                        color="yellow"
                        statusText={service.email ? "Activo" : "Inactivo"}
                        onToggle={() => { toggleService('email') }}
                        checked={service.email}

                    />

                </SimpleGrid>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput
                            label="Contact list name *"
                            placeholder="Nombre de la empresa"
                            {...form.getInputProps('companyName')}
                        />

                        <TextInput
                            type="tel"
                            label="Phone Number"
                            placeholder="(__) __-____"
                            {...form.getInputProps('phoneNumber')}
                        />

                        <div>
                            <Text size="sm" fw={500} mb={4}>Add recipients *</Text>
                            <Group align="flex-end">
                                <TextInput
                                    placeholder="Type an email address"
                                    style={{ flex: 1 }}
                                    value={newEmail}
                                    error={emailError}
                                    onChange={(e) => {
                                        setNewEmail(e.target.value);
                                        if (emailError) setEmailError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddRecipient();
                                        }
                                    }}
                                />
                                <AtomButton
                                    variant="default"
                                    leftSection={<IconPlus size={16} />}
                                    onClick={handleAddRecipient}
                                >
                                    Add
                                </AtomButton>
                            </Group>
                        </div>

                        <ScrollArea.Autosize mah={220} bd="1px solid var(--mantine-color-default-border)" p="xs">
                            <Stack gap="xs">
                                {recipients.length === 0 ? (
                                    <Text size="sm" c="dimmed" ta="center" py="sm">No hay destinatarios agregados.</Text>
                                ) : (
                                    recipients.map((email, index) => {
                                        const initial = email.charAt(0).toUpperCase();
                                        return (
                                            <Group key={index} justify="space-between" py={4} px="xs" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                                <Group>
                                                    <Avatar color="blue" radius="xl" size="sm">{initial}</Avatar>
                                                    <Text size="sm">{email}</Text>
                                                </Group>
                                                <AtmoAction variant="subtle"
                                                    color="gray"
                                                    onClick={() => handleRemoveRecipient(email)}
                                                    icon={IconX} />
                                            </Group>
                                        );
                                    })
                                )}
                            </Stack>
                        </ScrollArea.Autosize>

                        <Group justify="flex-end" mt="md">

                            <AtomButton variant="default" onClick={onClose}>Cancel</AtomButton>
                            <AtomButton type="submit" color="teal">Save</AtomButton>
                        </Group>
                    </Stack>
                </form>
            </Modal>
            <SftModal
                clientId={clientId}
                opened={sftpOpened}
                onClose={closeSftp} />
        </>
    );
}