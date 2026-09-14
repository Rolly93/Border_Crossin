import {
  PasswordInput,
  Alert,
  Select,
  Button,
  Stack,
  Group,
  Checkbox,
} from '@mantine/core';
import { AtomTextInput } from '@/components/atoms/AtomTextInput';
import { useLoginForm } from '../hook/useLoginForm';

interface NewuserFormProps {
  onSuccess?: () => void;
  onRfc?: string
}

export function NewuserForm({ onSuccess, onRfc }: NewuserFormProps) {
  const { loading, error, setUserData, userData, setError, signIn } = useLoginForm();

  const handleSubmit = async (e: React.FormEvent) => {
    if (onSuccess && onRfc) {

      onSuccess()
    } else {
      await signIn(userData)
    }


  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert color="red" mb="md" title="Creation Failed" onClose={() => setError('')} withCloseButton>
          {error}
        </Alert>
      )}

      <Stack gap="md">
        <AtomTextInput
          label="Username"
          placeholder="johndoe"
          value={userData.username}
          onChange={(e) => setUserData((prev) => { return { ...prev, username: e.target.value } })}
          required
        />

        <AtomTextInput
          label="Email"
          placeholder="you@example.com"
          value={userData.email}
          onChange={(e) => setUserData((prev) => { return { ...prev, email: e.target.value } })}
          required
        />

        <Group grow align="flex-start">
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={userData.password}
            onChange={(e) => setUserData((prev) => { return { ...prev, password: e.target.value } })}
            required
          />


          <Select
            label="Role"
            placeholder="Select role"
            value={userData.role}
            onChange={(value) =>
              setUserData((prev) => ({ ...prev, role: value ?? '' }))
            } data={[
              { value: 'csr', label: 'Csr' },
              { value: 'admin', label: 'Admin' },
            ]}
            required
          />
          <Checkbox
            label="Is it Admin?"
            checked={userData.isAdmin}
            onChange={(event) => {
              const isChecked = event.currentTarget.checked;
              setUserData((prev) => ({ ...prev, isAdmin: isChecked }));
            }}
          />

        </Group>

        <Button type="submit" loading={loading} fullWidth mt="sm" size="md">
          Create User Account
        </Button>
      </Stack>
    </form>
  );
}