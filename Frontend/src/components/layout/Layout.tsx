import { AppShell, Burger, Group, Skeleton, Text, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalNotifications } from '@/features/notfications/hooks/useGlobalNotifications';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { AtomButton } from '../atoms/AtomButton';
import { useAuth } from '@/features/login/context/AuthContext';
export function Layout() {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const { logout } = useAuth()
  const navigate = useNavigate();
  useEffect(() => {
    close();
  }, [location, close])
  useGlobalNotifications()


  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: 230, sm: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700}>My Dashboard</Text>

          </Group>
          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Text size="sm" fw={500} c="dimmed" mb="xs">Navigation</Text>
        <NavLink component={Link} to="/dashboard"
          label="Dashboard"
          active={location.pathname === '/dashboard'} />

        <NavLink component={Link}
          to="/sftp_connection"
          label='Sftp Connection'
          active={location.pathname === '/sftp_connection'} />

        <Text size="sm" fw={500} c="dimmed" mb="xs">Employees</Text>
        {/**<Skeleton height={28} mt="sm" animate={false} radius="xl" /> **/}

        <AppShell.Section pt={'md'}>
          <AtomButton variant={'light'} color='red' fullWidth onClick={handleLogout}>
            Log Out
          </AtomButton>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}