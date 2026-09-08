import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Alert
} from '@mantine/core';
import { useLoginForm } from '../hook/useLoginForm';

export function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLoginForm();

  return (
    <>
      <Title ta="center" order={2}>
        Welcome Back
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert color="red" mb="md" title="Login Failed">
              {error}
            </Alert>
          )}

          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            mt="md"
          />

          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Sign In
          </Button>
        </form>
      </Paper>
    </>
  );
}