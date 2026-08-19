// components/Layout.tsx
import { AppShell, Burger, Group, Skeleton, Text,NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import { Outlet , Link, useLocation} from 'react-router-dom';
import { ColorSchemeToggle } from './ColorSchemeToggle/ColorSchemeToggle';
export function Layout() {
  const [opened, { toggle ,close}] = useDisclosure();
  const location = useLocation();

  useEffect(()=>{
    close();
  },[location,close])

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: {base:230 , sm:300},
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      {/* 1. Header Section */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700}>My Dashboard</Text>
            
          </Group>
                  <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      {/* 2. Navbar Section */}
      <AppShell.Navbar p="md">
        <Text size="sm" fw={500} c="dimmed" mb="xs">Navigation</Text>
        <NavLink component={Link} to="/" 
        label="Dashboard" 
        active={location.pathname ==='/'}/>
        
        <NavLink component={Link} 
        to="/sftp_connection" 
        label='Sftp Connection' 
        active={location.pathname ==='/sftp_connection'}/>

        <Text size="sm" fw={500} c="dimmed" mb="xs">Employees</Text>
        {/**<Skeleton height={28} mt="sm" animate={false} radius="xl" /> **/}
        </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}