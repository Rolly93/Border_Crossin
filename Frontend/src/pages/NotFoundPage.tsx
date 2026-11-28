import { Button, Code, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconHome, IconTruck } from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/login/context/AuthContext';

function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Sin sesión, "inicio" es el login; con sesión, el dashboard.
  const homePath = isAuthenticated ? '/dashboard' : '/login';
  const homeLabel = isAuthenticated ? 'Ir al dashboard' : 'Ir al inicio de sesión';

  return (
    <Container size={520} py={80}>
      <Stack align="center" gap="md" ta="center">
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            background:
              'linear-gradient(135deg, var(--mantine-color-navy-6), var(--mantine-color-navy-8))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconTruck size={32} color="white" />
        </div>

        <Title order={1} fw={900} fz={72} c="navy" lh={1}>
          404
        </Title>
        <Title order={3} fw={700}>
          Página no encontrada
        </Title>
        <Text c="slate" size="sm">
          La ruta <Code>{location.pathname}</Code> no existe o fue movida.
        </Text>

        <Group mt="md" gap="sm" justify="center">
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Regresar
          </Button>
          <Button component={Link} to={homePath} replace leftSection={<IconHome size={16} />}>
            {homeLabel}
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

export default NotFoundPage;
