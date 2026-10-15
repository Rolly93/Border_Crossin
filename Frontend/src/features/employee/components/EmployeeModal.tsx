import { Alert, Checkbox, Group, Modal, PasswordInput, SegmentedControl, Stack, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { AtomButton } from '@/components/atoms/AtomButton';
import { EmployeeType } from '../type/employee.interface';
import { useEmployeeForm } from '../hook/useEmployeeForm';

interface EmployeeModalProps {
  opened: boolean;
  onClose: () => void;
  employeeForm: ReturnType<typeof useEmployeeForm>;
}

const TYPE_OPTIONS: { value: EmployeeType; label: string }[] = [
  { value: 'cargo', label: 'Cargo (con cuenta de usuario)' },
  { value: 'operador', label: 'Operador (con licencia y unidad)' },
];

export function EmployeeModal({ opened, onClose, employeeForm }: EmployeeModalProps) {
  const { form, submit, submitError, submitting, clearSubmitError, isOperator, isEditing } = employeeForm;

  const handleClose = () => {
    clearSubmitError();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={isEditing ? "Editar empleado" : "Nuevo empleado"} centered size="lg">
      <form onSubmit={(e) => { e.preventDefault(); submit().then((res) => { if (res) handleClose(); }); }}>
        <Stack gap="sm">
          {submitError && (
            <Alert color="red" withCloseButton onClose={clearSubmitError}>
              {submitError}
            </Alert>
          )}

          <SegmentedControl
            fullWidth
            data={TYPE_OPTIONS}
            {...form.getInputProps('employeeType')}
          />

          <Group grow>
            <TextInput label="Nombre" required {...form.getInputProps('firstName')} />
            <TextInput label="Apellido" required {...form.getInputProps('lastName')} />
          </Group>

          <Group grow>
            <DateInput label="Fecha de nacimiento" required maxDate={new Date()}
              {...form.getInputProps('dateOfBirth')} />
            <TextInput label="RFC" required style={{ textTransform: 'uppercase' }}
              {...form.getInputProps('rfc')} />
          </Group>

          {!isOperator && (
            <>
              <Group grow>
                <TextInput label="Usuario" required autoComplete="off" {...form.getInputProps('username')} />
                <TextInput label="Correo" required type="email" {...form.getInputProps('email')} />
              </Group>
              <Group grow>
                <PasswordInput
                  label="Contraseña"
                  required={!isEditing}
                  autoComplete="new-password"
                  description={isEditing ? "Dejar en blanco para mantener la actual" : "Mínimo 8 caracteres"}
                  {...form.getInputProps('password')}
                />
                <PasswordInput
                  label="Confirmar contraseña"
                  required={!isEditing}
                  autoComplete="new-password"
                  {...form.getInputProps('confirmPassword')}
                />
              </Group>
              <Checkbox label="Es administrador (puede dar de alta y baja clientes y empleados)"
                {...form.getInputProps('isAdmin', { type: 'checkbox' })} />
            </>
          )}

          {isOperator && (
            <Group grow>
              <TextInput label="Número de licencia" required {...form.getInputProps('licenseNumber')} />
              <DateInput label="Vencimiento de licencia" required
                {...form.getInputProps('licenseExpiration')} />
              <TextInput label="Gafete" {...form.getInputProps('gafetId')} />
            </Group>
          )}

          <Group justify="flex-end" mt="md">
            <AtomButton variant="default" onClick={handleClose}>Cancelar</AtomButton>
            <AtomButton type="submit" loading={submitting}>Guardar</AtomButton>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}