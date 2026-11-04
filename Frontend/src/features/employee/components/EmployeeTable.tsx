/** @format */

import { Group, Table, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useRef, useCallback, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { AtomButton } from "@/components/atoms/AtomButton";
import { useAuth } from "@/features/login/context/AuthContext";
import {
  TEmployeeBaseResponse,
  TEmployeeCreateUnion, TEmployeeCreateUnionResponse, TEmployeeDriverRequest,
  TEmployeeType, TEmployeeUserRequest, useEmployee
} from "../hook/useEmployee";
import { useEmployeeForm } from "../hook/useEmployeeForm";
import { EmployeeTableRow } from "./EmployeeTableRow";
import { EmployeeModal } from "./EmployeeModal";


const DEFAULT_FORM_VALUES = {
  employeeType: "csr" as TEmployeeType,
  firstName: "",
  lastName: "",
  dateOfBirth: null,
  rfc: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  isAdmin: false,
  licenseNumber: "",
  licenseExpiration: null,
  gafetId: "",
};

function isUserResponse(
  employee: TEmployeeCreateUnion,
): employee is TEmployeeUserRequest {
  return "username" in employee;
}

function isDriverResponse(
  employee: TEmployeeCreateUnion,
): employee is TEmployeeDriverRequest {
  return "licenseNumber" in employee;
}

export function EmployeeTable() {
  const { isAdmin } = useAuth();
  const {
    employeeData,
    loading,
    hasMore,
    fetchNextPage,
    createEmployeeAccount,
    updateEmployee,
    getEmployeeData,
  } = useEmployee();

  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<TEmployeeCreateUnionResponse | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const employeeForm = useEmployeeForm({
    initialEmployee: selectedEmployee,
    onSubmitAction: async (payload: TEmployeeCreateUnion | TEmployeeCreateUnionResponse, id) => {
      if (id) {
        return await updateEmployee(id, payload as TEmployeeCreateUnionResponse);
      }
      return await createEmployeeAccount(payload);
    },
    onSuccess: () => {
      // Refresh your table/data here if needed
    },
  });

  const handleOpenCreate = () => {
    setSelectedEmployee(null);

    employeeForm.form.setInitialValues(DEFAULT_FORM_VALUES);
    employeeForm.form.setValues(DEFAULT_FORM_VALUES);
    employeeForm.form.clearErrors();

    openModal();
  };

  const handleOpenEdit = async (employee: TEmployeeBaseResponse) => {
    const employeeToEdit = await getEmployeeData(
      employee.id!,
      employee.role as TEmployeeType,
    );
    if (!employeeToEdit) {
      return;
    }

    const formValues = {
      employeeType: (employeeToEdit.role === 'csr'
        ? "operador"
        : "csr") as TEmployeeType,

      firstName: employeeToEdit.firstName || "",
      lastName: employeeToEdit.lastName || "",
      dateOfBirth: employeeToEdit.dateOfBirth
        ? new Date(employeeToEdit.dateOfBirth)
        : null,
      rfc: employeeToEdit.rfc || "",
      username: isUserResponse(employeeToEdit)
        ? employeeToEdit.username || ""
        : "",
      email: (isUserResponse(employeeToEdit) && employeeToEdit.email) || "",
      password: "",
      confirmPassword: "",
      isAdmin: isUserResponse(employeeToEdit)
        ? employeeToEdit.isAdmin || false
        : false,
      licenseNumber: isDriverResponse(employeeToEdit)
        ? employeeToEdit.licenseNumber || ""
        : "",
      licenseExpiration:
        isDriverResponse(employeeToEdit) && employeeToEdit.licenseExpiration
          ? new Date(employeeToEdit.licenseExpiration)
          : null,
      gafetId: isDriverResponse(employeeToEdit)
        ? employeeToEdit.gafetId || ""
        : "",
    };

    employeeForm.form.setInitialValues(formValues);
    employeeForm.form.setValues(formValues);
    employeeForm.form.clearErrors();

    openModal();
  };

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) {
        return;
      }
      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNextPage();
        }
      });
      if (node) {
        return observer.current.observe(node);
      }
    },
    [loading, hasMore, fetchNextPage],
  );

  return (
    <>
      <Group justify="space-between" mt="md">
        <Title order={3}>Empleados</Title>
        {isAdmin && (
          <AtomButton
            leftSection={<IconPlus size={16} />}
            color="blue"
            onClick={handleOpenCreate}>
            Nuevo empleado
          </AtomButton>
        )}
      </Group>

      <EmployeeModal
        opened={modalOpened}
        onClose={closeModal}
        employeeForm={employeeForm}
      />

      <Table.ScrollContainer minWidth={760} h={500}>
        <Table
          highlightOnHover
          horizontalSpacing="md"
          verticalSpacing="xs"
          miw={700}
          layout="fixed"
          stickyHeader
          mt={25}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Apellido</Table.Th>
              <Table.Th>Cargo</Table.Th>
              <Table.Th>Fecha de Ingreso</Table.Th>
              <Table.Th>R.F.C</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading && employeeData.length === 0 ? (
              <TableSkeletonRows rows={4} columns={5} />
            ) : (
              employeeData.map((employee, index) => {
                const isLastElement = employeeData.length === index + 1;
                return (
                  <EmployeeTableRow
                    employee={employee}
                    ref={isLastElement ? lastElementRef : null}
                    key={employee.id}
                    onClick={() => handleOpenEdit(employee)}
                  />
                );
              })
            )}
            {loading && <TableSkeletonRows rows={4} columns={5} />}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
