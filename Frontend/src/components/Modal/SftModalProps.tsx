import { Button, Drawer, Group, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";

interface IsftModalProps {
    opened: boolean;
    onClose: () => void;
}


export default function SftModal({ opened, onClose }: IsftModalProps) {
    const {t,i18n} =useTranslation()
    const form = useForm({
        mode:'controlled',
        validateInputOnChange:true,
        initialValues:{
            username:'',
            password:'',
            port:'',
            host:''

        }
    })


    return (
<Drawer offset={8} radius="md" opened={opened} onClose={onClose} >
        <form onSubmit={form.onSubmit((values)=>{onsubmit as any})}>

        <Stack gap={'xl'} >
        <Title order={2}>SFTP Configuration</Title>
        <TextInput
        label={t('modal.labels.username')}
        placeholder={t('modal.placeholders.username')}
        required
        {...form.getInputProps('username')}/>

        <TextInput
        label={t('modal.labels.password')}
        placeholder={t('modal.placeholders.password')}
        required
        {...form.getInputProps('password')}/>


        <TextInput
        label={t('modal.labels.port')}
        placeholder={t('modal.placeholders.port')}
        required
        {...form.getInputProps('port')}/>

        <TextInput

        label={t('modal.labels.host')}
        placeholder={t('modal.placeholders.host')}
        required
        {...form.getInputProps('host')}/>


        <Group justify="flex-end" mt="xl">
            <Button type="submit" color="dark">
              GUARDAR
            </Button>
          </Group>
        </Stack>

        </form>
    </Drawer>)
}