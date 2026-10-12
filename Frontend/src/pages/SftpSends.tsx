import { Container } from '@mantine/core';
import { SftpSendsPanel } from '@/features/sftp/components/SftpSendsPanel';

export function SftpSends() {
  return (
    <Container size="responsive">
      <SftpSendsPanel />
    </Container>
  );
}
