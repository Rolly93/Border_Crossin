import { Container } from '@mantine/core';
import { LoginForm } from '../features/login/components/LoginForm';

export function LoginPage() {
  return (
    <Container size={420} my={40}>
      <LoginForm />
    </Container>
  );
}