import { Container } from '@mantine/core';
import { ClientTable } from '@/features/clients/components/ClienteTable';

export function ClientsPage() {
  return (
    <Container size="responsive">
      <ClientTable />
    </Container>
  );
}
