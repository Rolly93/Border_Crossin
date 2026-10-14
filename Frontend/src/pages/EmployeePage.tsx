import { EmployeeTable } from '@/features/employee/components/EmployeeTable';
import { Container, Stack, Title, Text } from '@mantine/core';

export function EmployeePage() {
  return (
    <Container size="xl">
      <Stack gap="md" mb="lg">
        <Title order={3} fw={800} c="navy">
          Empleados
        </Title>
        <Text size="sm" c="slate">
          Directorio de personal y operadores
        </Text>
      </Stack>
      <EmployeeTable />
    </Container>
  );
}