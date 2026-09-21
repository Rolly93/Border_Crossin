import { EmployeeTable } from "@/features/employee/components/EmployeeTable";
import { Container } from "@mantine/core";

export function EmployeePage() {
  return (<Container size="xl">
    <EmployeeTable />
  </Container>)
}