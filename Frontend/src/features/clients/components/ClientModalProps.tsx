import { ICliente } from "@/features/clients/types/Cliente";
import { Modal, TextInput, Button, Stack, Group, ScrollArea, Avatar, Text, ActionIcon, SimpleGrid } from "@mantine/core";
import { useForm, isEmail } from "@mantine/form";
import { useEffect, useState } from "react";
import { IconFileText, IconMail, IconPlus, IconX } from "@tabler/icons-react";
import ActionCard from "../../../components/ui/ActionCard";
import SftModal from "../../../components/Modal/SftModalProps";
import { useDisclosure } from "@mantine/hooks";

interface ClienteModalProps {
    onSelectClient: ICliente | null;
    opened: boolean;
    onClose: () => void;
}

export default function ClientModalProps({ onSelectClient, opened, onClose }: ClienteModalProps) {
    const [sftpOpened, { open: openSftp, close: closeSftp }] = useDisclosure(false);
    const [newEmail, setNewEmail] = useState("");
    const [recipients, setRecipients] = useState<string[]>([]);
    const [emailError, setEmailError] = useState<string | null>(null);

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            companyName: '',
            mainContact: '',
            phoneNumber: ''
        }
    });

    useEffect(() => {
        if (onSelectClient) {
            form.setValues({
                companyName: onSelectClient.name || '',
                mainContact: onSelectClient.contacto || '',
                phoneNumber: onSelectClient.telefono || ''
            });
            setRecipients(onSelectClient.email || []);
            setEmailError(null);
        }
    }, [onSelectClient]);

    if (!onSelectClient) {
        return null;
    }

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
        const finalData = {
            ...values,
            email: recipients
        };
        console.log("Datos guardados:", finalData);
        onClose();
    };

    return (
        <>

            <Modal opened={opened} onClose={onClose} title="Editar Cliente" size="lg">
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 2 }} spacing={'md'}>
                    <ActionCard
                        title="Email Notification"
                        icon={<IconMail size={20} />}
                        color="yellow"
                        statusText={onSelectClient.email && onSelectClient.email.length > 0 ? "Activo" : "Inactivo"}
                        onClick={() => {

                        }}
                    />
                    <ActionCard
                        title="SFT Service"
                        icon={<IconFileText size={20} />}
                        color="grape"
                        statusText={onSelectClient.sftService ? "Activo" : "Inactivo"}
                        onClick={() => {
                            openSftp()

                        }}
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
                            label="Description"
                            placeholder="Contacto principal"
                            {...form.getInputProps('mainContact')}
                        />

                        <TextInput
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
                                <Button
                                    variant="default"
                                    leftSection={<IconPlus size={16} />}
                                    onClick={handleAddRecipient}
                                >
                                    Add
                                </Button>
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
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="gray"
                                                    onClick={() => handleRemoveRecipient(email)}
                                                >
                                                    <IconX size={16} />
                                                </ActionIcon>
                                            </Group>
                                        );
                                    })
                                )}
                            </Stack>
                        </ScrollArea.Autosize>

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={onClose}>Cancel</Button>
                            <Button type="submit" color="teal">Save</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
            <SftModal
                opened={sftpOpened}
                onClose={closeSftp} />
        </>
    );
}