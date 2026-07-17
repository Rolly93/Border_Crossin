import { Button, Group, Switch, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
export function ColorSchemeToggle() {
const { colorScheme, setColorScheme } = useMantineColorScheme();
return (
  
    <Group justify="center">
      <Switch
        size="lg"
        color="dark.4"
        onLabel={<IconSun size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />}
        offLabel={<IconMoon size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />}
        
        checked={colorScheme === 'dark'}
        onChange={(event) => 
          setColorScheme(event.currentTarget.checked ? 'dark' : 'light')
        }
      />
    </Group>
  );
}
