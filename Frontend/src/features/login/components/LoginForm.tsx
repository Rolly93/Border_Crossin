import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Alert,
  Text,
  Anchor
} from '@mantine/core';
import { useLoginForm } from '../hook/useLoginForm';
import { AtomButton } from '@/components/atoms/AtomButton';
import { useNavigate } from 'react-router-dom';
import { FormEvent } from 'react';

export function LoginForm() {
  const {
    userData, setUserData,
    error,
    loading,
    Login,
  } = useLoginForm();
  const navigate = useNavigate()

  function handelSubmit(values: FormEvent) {
    values.preventDefault()
    const credentials = {
      username: userData.username,
      password: userData.password,
    };

    Login(credentials);

  }

  return (
    <>
      <Title ta="center" order={2}>
        Welcome Back
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handelSubmit}>
          {error && (
            <Alert color="red" mb="md" title="Login Failed">
              {error}
            </Alert>
          )}

          <TextInput
            label="username"
            placeholder="usarname"
            value={userData.username}
            onChange={(e) => setUserData((prev) => {
              return { ...prev, username: e.target.value }
            })}
            required
          />


          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={userData.password}
            onChange={(e) => setUserData((prev) => {
              return { ...prev, password: e.target.value }
            })} required
            mt="md"
          />

          <AtomButton type="submit" fullWidth mt="xl" loading={loading}>
            Sign In
          </AtomButton>
          <Text c={'dimmed'} size='sm' ta='center'>
            Don't have an account? {''}
            <Anchor component="button" type='button' size='sm' onClick={() => navigate('/onetime')}>
              Create Account
            </Anchor>
          </Text>
        </form>
      </Paper>
    </>
  );
}