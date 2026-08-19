// pages/Home.page.tsx
import { Container } from '@mantine/core';
import { UnderConstruction } from './UnderConstruction';
export function SftpConnection() {
  return (
    <Container size="responsive">
      <UnderConstruction projectName='sftp Connection' progress={10} expectedLaunchDate='Nov 2026'/>
    </Container>
  );
}