import { ClientTable } from '@/features/clients/components/ClienteTable';
import { Container } from '@mantine/core';
//import { UnderConstruction } from './UnderConstruction';
export function SftpConnection() {
  return (
    <Container size="responsive" fluid p="md" mih="100vh">
      <ClientTable />
    </Container>
  );
}