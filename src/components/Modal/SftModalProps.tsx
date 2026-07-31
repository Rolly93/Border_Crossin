import { Button, Drawer, Group, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

interface IsftModalProps {
    opened: boolean;
    onClose: () => void;
}


export default function SftModal({ opened, onClose }: IsftModalProps) {  
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
        label="USERNAME"
        placeholder="Username"
        required
        {...form.getInputProps('username')}/>

        <TextInput
        label='PASSWORD'
        placeholder="Password"
        required
        {...form.getInputProps('password')}/>

        
        <TextInput
        label='PORT'
        placeholder="port"
        required
        {...form.getInputProps('port')}/>

        <TextInput
        
        label='HOST'
        placeholder="host"
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