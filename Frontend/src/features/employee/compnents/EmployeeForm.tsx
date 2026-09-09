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

interface EmployeeFormValues {
  name: string;
  last_name: string;
  role: string;
  rfc_employee: string;

}

interface EmployeeFormProps {
  onSuccess?: () => void;
}

export function EmployeeForm({ onSuccess }: EmployeeFormProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<EmployeeFormValues>({
    initialValues: {
      name: '',
      last_name: '',
      role: '',
      rfc_employee: '',
    },
    validate: {
      name: (val) => (val.trim().length > 0 ? null : 'First name is required'),
      last_name: (val) => (val.trim().length > 0 ? null : 'Last name is required'),
      role: (val) => (val ? null : 'Role is required'),
      rfc_employee: (val) =>
        /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/i.test(val.trim())
          ? null
          : 'Invalid RFC format (e.g., ABCD123456XYZ)',
    },
  });

  const handleSubmit = async (values: EmployeeFormValues) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to save employee');
      }

      navigate('/sftp_connection');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Last Name"
            placeholder="Doe"
            required
            {...form.getInputProps('last_name')}
          />
        </Group>

        <TextInput
          label="RFC"
          placeholder="ABCD123456XYZ"
          required
          mb="sm"
          style={{ textTransform: 'uppercase' }}
          {...form.getInputProps('rfc_employee')}
        />

        <Select
          label="Role"
          placeholder="Select job role"
          required
          mb="xl"
          data={[
            { value: 'driver', label: 'Driver' },
            { value: 'operator', label: 'Operator' },
            { value: 'admin', label: 'Admin' },
            { value: 'manager', label: 'Manager' },
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