import { Container } from '@mantine/core';
import { SftpClientList } from '@/features/sftp/components/SftpClientList';

export function SftpConnection() {
  return (
    <Container size="responsive">
      <SftpClientList />
    </Container>
  );
}
