import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import {
  TextInput,
  Select,
  Button,
  Paper,
  Title,
  Alert,
  Group,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { validateRFC } from '@/components/utils/businessRules';
import { EmployeeFormProps, IEmployeeFormsValues } from '../type/employee.interface';
import { useEmployee } from '../hook/useEmployee';

export function EmployeeForm({ onSuccess }: EmployeeFormProps) {
  const navigate = useNavigate();
  const { createNewEmployee, error, loading, setError } = useEmployee()
  const form = useForm<IEmployeeFormsValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      role: '',
      rfc: '',
      dateOfBirth: new Date(),
    }
  });

  const handleSubmit = async (values: IEmployeeFormsValues) => {

    try {

      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : new Date(),
      };
      const { isValid, errors } = validateRFC(formattedValues);

      if (!isValid && errors.length > 0) {
        setError(errors);
        return;
      }
      await createNewEmployee(values)
      if (onSuccess) {
        onSuccess()
      } else {

        navigate('/sftp_connection');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };


  return (
    <Paper radius="md" p="xl" withBorder style={{ maxWidth: 500, margin: '40px auto' }}>
      <Title order={2} mb="md">
        Create Employee Record
      </Title>

      {error && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group grow mb="sm">
          <TextInput
            label="First Name"
            placeholder="John"
            required
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Last Name"
            placeholder="Doe"
            required
            {...form.getInputProps('lastName')}
          />
          <DateInput label="Date Birth" placeholder='01/01/1990' required
            {...form.getInputProps('dateOfBirth')} />
        </Group>

        <TextInput
          label="RFC"
          placeholder="ABCD123456XYZ"
          required
          mb="sm"
          style={{ textTransform: 'uppercase' }}
          {...form.getInputProps('rfc')}
        />

        <Select
          label="Role"
          placeholder="Select job role"
          required
          mb="xl"
          data={[
            { value: 'operator', label: 'Operator' },
            { value: 'csr', label: 'Csr' },
          ]}
          {...form.getInputProps('role')}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Employee
          </Button>
        </Group>
      </form>
    </Paper>
  );
}