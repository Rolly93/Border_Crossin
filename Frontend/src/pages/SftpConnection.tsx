// pages/Home.page.tsx
import { Container } from '@mantine/core';
import { ClientTable } from '@/features/clients/components/ClienteTable';
import { useClients } from '@/features/clients/hooks/useClients';
export function SftpConnection() {
  return (
    <Container size="responsive">
      <ClientTable />
    </Container>
  );
}