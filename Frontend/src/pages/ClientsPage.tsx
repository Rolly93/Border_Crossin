import { Container, Stack, Title, Text } from '@mantine/core';
import { ClientTable } from '@/features/clients/components/ClienteTable';

function ClientsPage() {
  return (
    <Container size="xl">
      <Stack gap="md" mb="lg">
        <Title order={3} fw={800} c="navy">
          Clientes
        </Title>
        <Text size="sm" c="slate">
          Gestión de clientes y reglas de referencia
        </Text>
      </Stack>
      <ClientTable />
    </Container>
  );
}

export default ClientsPage;