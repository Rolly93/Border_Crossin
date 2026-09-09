import { useState } from 'react';
import {
  PasswordInput,
  Alert,
  Select,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import { AtomTextInput } from '@/components/atoms/AtomTextInput';

interface NewuserFormProps {
  onSuccess?: () => void;
}

export function NewuserForm({ onSuccess }: NewuserFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string | null>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/new_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          is_admin: role === 'admin',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create user account');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert color="red" mb="md" title="Creation Failed" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <Stack gap="md">
        <AtomTextInput
          label="Username"
          placeholder="johndoe"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          required
        />

        <AtomTextInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
        />

        <Group grow align="flex-start">
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Select
            label="Role"
            placeholder="Select role"
            value={role}
            onChange={setRole}
            data={[
              { value: 'user', label: 'User' },
              { value: 'operator', label: 'Operator' },
              { value: 'admin', label: 'Admin' },
            ]}
            required
          />
        </Group>

        <Button type="submit" loading={loading} fullWidth mt="sm" size="md">
          Create User Account
        </Button>
      </Stack>
    </form>
  );
}