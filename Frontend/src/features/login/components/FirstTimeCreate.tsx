import { useEffect, useState } from 'react';
import { Container, Paper, Stepper, Title, Text, Stack, Checkbox, Group, PasswordInput, TextInput, SegmentedControl, Alert } from '@mantine/core';
import { EmployeeForm } from "@/features/employee/components/EmployeeForm";
import { NewuserForm } from "./NewUserForm";
import { useNavigate } from 'react-router-dom';
import { useEmployee } from '@/features/employee/hook/useEmployee';
import { useEmployeeForm } from '@/features/employee/hook/useEmployeeForm';
import { AtomButton } from '@/components/atoms/AtomButton';
import { DateInput } from '@mantine/dates';

export function FirstTimeLog() {
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const navigate = useNavigate()
  const { createEmployeeAccount } = useEmployee();
  const employeeForm = useEmployeeForm({
    onSubmitAction: async (payload) => {

      const newEmployee = await createEmployeeAccount(payload);
      if (newEmployee) {

        setIsComplete(true);
      }

    }
  });
  const { form, submit, submitError, submitting, clearSubmitError, isOperator } = employeeForm;
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 2000);
      return () => clearTimeout(timer)
    }
  }, [isComplete, navigate])

  return (
    <Container size="sm" py={50}>
      <Paper withBorder shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb={5}>
          Initial System Setup
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={30}>
          Create the primary employee record and administrator account
        </Text>
        {isComplete ? (<Text ta={'center'} fw={500} c={'green'} py={'xl'}>
          Setup complete! Rederecting to dashboard
        </Text>) : (<form onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <Stack gap="sm">
            {submitError && (
              <Alert color="red" withCloseButton onClose={clearSubmitError}>
                {submitError}
              </Alert>
            )}

            {/* Form fields matching your unified form */}
            <SegmentedControl
              fullWidth
              data={[
                { value: 'csr', label: 'C.S.R (Representante de Cuenta)' },
              ]}
              {...form.getInputProps('employeeType')}
            />

            <Group grow>
              <TextInput label="Nombre" required {...form.getInputProps('firstName')} />
              <TextInput label="Apellido" required {...form.getInputProps('lastName')} />
            </Group>

            <Group grow>
              <DateInput label="Fecha de nacimiento" required maxDate={new Date()} {...form.getInputProps('dateOfBirth')} />
              <TextInput label="RFC" required style={{ textTransform: 'uppercase' }} {...form.getInputProps('rfc')} />
            </Group>

            <>
              <Group grow>
                <TextInput label="Usuario" required autoComplete="off" {...form.getInputProps('username')} />
                <TextInput label="Correo" required type="email" {...form.getInputProps('email')} />
              </Group>
              <Group grow>
                <PasswordInput label="Contraseña" required autoComplete="new-password" {...form.getInputProps('password')} />
                <PasswordInput label="Confirmar contraseña" required autoComplete="new-password" {...form.getInputProps('confirmPassword')} />
              </Group>
              <Checkbox label="Es administrador" {...form.getInputProps('isAdmin', { type: 'checkbox' })} checked />
            </>

            <Group justify="flex-end" mt="md">
              <AtomButton
                variant="default"
                onClick={() => navigate('/login')}
              >
                Cancelar
              </AtomButton>
              <AtomButton type="submit" loading={submitting}>
                Guardar y Continuar
              </AtomButton>
            </Group>
          </Stack>
        </form>)}
      </Paper>
    </Container>
  );
}