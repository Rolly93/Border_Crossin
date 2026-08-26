import { Container } from '@mantine/core';
import { UnderConstruction } from './UnderConstruction';
export function EmployeePage() {
  return (
    <Container size="responsive">
      <UnderConstruction projectName='Employee Page' expectedLaunchDate='09/30/2026' progress={10} />
    </Container>
  );
}