import { Container } from '@mantine/core';
//import { UnderConstruction } from './UnderConstruction';
import { ClientTable } from '@/components/ClientDash/ClienteTable';
export function SftpConnection() {
  return (
    <Container  size="responsive" fluid p="md"  mih="100vh">
      <ClientTable/>
      </Container>
  );
}