import { AppShell, Burger, Group, Text, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalNotifications } from '@/features/notfications/hooks/useGlobalNotifications';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { AtomButton } from '../atoms/AtomButton';
import { useAuth } from '@/features/login/context/AuthContext';
import { useScacSetup } from '@/features/system/useScacSetup';
import { ScacSetupModal } from '../Modal/ScacSetupModal';
import { IconTruck, IconBuilding, IconRoute, IconFileText, IconUsers, IconSettings, IconLogout, IconDashboard, IconKey } from '@tabler/icons-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/clients', label: 'Clientes', icon: IconBuilding },
  { to: '/sftp_connection', label: 'SFTP', icon: IconRoute },
  { to: '/sftp_sends', label: 'Envíos XML', icon: IconFileText },
  { to: '/employee', label: 'Empleados', icon: IconUsers },
  { to: '/units', label: 'Unidades', icon: IconTruck },
] as const;

const sectionLabelStyle = {
  fontSize: '0.65rem',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'var(--mantine-color-slate-5)',
  marginBottom: '8px',
  paddingLeft: '8px',
};

export function Layout() {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    close();
  }, [location, close]);
  
  useGlobalNotifications();
  const { needsSetup, saveScac } = useScacSetup();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: { base: 260, sm: 280 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" gap="md">
          <Group gap="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text
              fw={800}
              fz="lg"
              c="navy"
              tt="uppercase"
              style={{ letterSpacing: '0.08em' }}
            >
              XBorder
            </Text>
          </Group>
          <Group gap="sm">
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <Text
          size="xs"
          fw={700}
          c="slate"
          tt="uppercase"
          mb="sm"
          px="sm"
          style={sectionLabelStyle}
        >
          Navegación
        </Text>
        
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            component={Link}
            to={to}
            label={label}
            leftSection={<Icon size={16} />}
            active={location.pathname === to}
            mb={2}
          />
        ))}

        <AppShell.Section pt="md" mt="md" style={{ borderTop: '1px solid var(--mantine-color-slate-2)' }}>
          <Text
            size="xs"
            fw={700}
            c="slate"
            tt="uppercase"
            mb="sm"
            px="sm"
            style={sectionLabelStyle}
          >
            Sistema
          </Text>
          <NavLink
            component={Link}
            to="/system"
            label="Configuración"
            leftSection={<IconSettings size={16} />}
            active={location.pathname === '/system'}
            mb={2}
          />
          <AtomButton
            variant="light"
            color="rose"
            leftSection={<IconLogout size={16} />}
            fullWidth
            onClick={handleLogout}
            size="sm"
          >
            Cerrar sesión
          </AtomButton>
        </AppShell.Section>

        <ScacSetupModal opened={needsSetup} onSave={saveScac} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}