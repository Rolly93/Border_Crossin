import { Container, Stack, Title, Text } from '@mantine/core';
import { SftpClientList } from '@/features/sftp/components/SftpClientList';

function SftpConnection() {
  return (
    <Container size="xl">
      <Stack gap="md" mb="lg">
        <Title order={3} fw={800} c="navy">
          Conexiones SFTP
        </Title>
        <Text size="sm" c="slate">
          Configuración de canales de transmisión por cliente
        </Text>
      </Stack>
      <SftpClientList />
    </Container>
  );
}

export default SftpConnection;