import { Container, Stack, Title, Text } from '@mantine/core';
import { SftpSendsPanel } from '@/features/sftp/components/SftpSendsPanel';

function SftpSends() {
  return (
    <Container size="xl">
      <Stack gap="md" mb="lg">
        <Title order={3} fw={800} c="navy">
          Envíos XML
        </Title>
        <Text size="sm" c="slate">
          Historial y reintento de transmisiones de eventos
        </Text>
      </Stack>
      <SftpSendsPanel />
    </Container>
  );
}

export default SftpSends;