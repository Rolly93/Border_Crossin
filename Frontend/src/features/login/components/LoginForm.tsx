import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Alert,
  Text,
  Anchor,
  Stack,
} from '@mantine/core';
import { useLoginForm } from '../hook/useLoginForm';
import { AtomButton } from '@/components/atoms/AtomButton';
import { useNavigate, Link } from 'react-router-dom';
import { FormEvent } from 'react';
import { IconTruck, IconLock } from '@tabler/icons-react';

export function LoginForm() {
  const {
    userData, setUserData,
    error,
    loading,
    Login,
  } = useLoginForm();
  const navigate = useNavigate();

  async function handleSubmit(values: FormEvent<HTMLFormElement>) {
    values.preventDefault();
    const credentials = {
      username: userData.username,
      password: userData.password,
    };

    try {
      const result = await Login(credentials);

      if (result?.access_token) {
        localStorage.setItem('jwt_token', result.access_token);
        navigate('/dashboard');
      } else {
        console.error('Login failed: No access token returned from server');
      }
    } catch (err: any) {
      console.error('Login failed:', err.response?.data?.detail || err.message);
    }
  }

  return (
    <>
      <Stack gap="md" align="center" mb="xl">
        <div style={{
          width: 56, height: 56,
          borderRadius: 12,
          background: 'linear-gradient(135deg, var(--mantine-color-navy-6), var(--mantine-color-navy-8))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconTruck size={28} color="white" />
        </div>
        <Title order={2} fw={800} c="navy">
          XBorder
        </Title>
        <Text c="slate" size="sm">
          Sistema de seguimiento transfronterizo
        </Text>
      </Stack>

      <Paper withBorder shadow="sm" p="xl" radius="md" style={{ maxWidth: 400, width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && (
              <Alert color="rose" title="Error de acceso" radius="sm">
                {error}
              </Alert>
            )}

            <TextInput
              label="Usuario"
              placeholder="admin@test.com"
              value={userData.username}
              onChange={(e) => setUserData((prev) => ({ ...prev, username: e.target.value }))}
              required
              leftSection={<IconLock size={18} color="var(--mantine-color-slate-4)" />}
              autoComplete="username"
            />

            <PasswordInput
              label="Contraseña"
              placeholder="••••••••"
              value={userData.password}
              onChange={(e) => setUserData((prev) => ({ ...prev, password: e.target.value }))}
              required
              leftSection={<IconLock size={18} color="var(--mantine-color-slate-4)" />}
              autoComplete="current-password"
            />

            <AtomButton type="submit" fullWidth size="md" loading={loading} mt="sm">
              Iniciar sesión
            </AtomButton>

            <Text c="slate" size="sm" ta="center">
              ¿Primera vez?{' '}
              <Anchor component={Link} to="/onetime" size="sm" fw={600} c="amber">
                Crear cuenta
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </>
  );
}