// pages/Home.page.tsx
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import ShipmentTable from '../components/Table/ShipmentTable';
import Headers from '@/components/Header/Header';
import { Container } from '@mantine/core';
export function SftpConnection() {
  return (
    <Container size="responsive">
      <Headers/>
      <ShipmentTable />
    </Container>
  );
}