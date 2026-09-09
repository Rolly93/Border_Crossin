// pages/Home.page.tsx
import { Container } from '@mantine/core';
import { ClientTable } from '@/features/clients/components/ClienteTable';
export function SftpConnection() {
  return (
    <Container size="responsive">
      <ClientTable />
    </Container>
  );
}