/** @format */

import { Table } from "@mantine/core";
import { forwardRef } from "react";
import { TEmployeeBaseRequest } from "../hook/useEmployee";

interface EmployeeTableRowProps {
  employee: TEmployeeBaseRequest;
  onClick: (employee: TEmployeeBaseRequest) => void;
}

export const EmployeeTableRow = forwardRef<
  HTMLTableRowElement,
  EmployeeTableRowProps
>(({ employee, onClick }, ref) => {
  return (
    <Table.Tr
      ref={ref}
      style={{ "cursor": "pointer" }}
      onClick={() => onClick(employee)}>
      <Table.Td>{employee.firstName}</Table.Td>
      <Table.Td>{employee.lastName}</Table.Td>
      <Table.Td>{employee.role}</Table.Td>
      <Table.Td>{employee.hireDate}</Table.Td>
      <Table.Td>{employee.rfc}</Table.Td>
    </Table.Tr>
  );
});
