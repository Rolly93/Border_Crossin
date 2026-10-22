// Type declarations for @tabler/icons-react with barrel imports
// This enables TypeScript to work with: import { IconTruck } from '@tabler/icons-react'

declare module '@tabler/icons-react' {
  import type { ComponentType, SVGAttributes } from 'react';

  type IconProps = SVGAttributes<SVGSVGElement> & {
    size?: number | string;
    stroke?: number | string;
    color?: string;
  };

  // Type for direct component imports
  export type TablerIcon = ComponentType<IconProps>;

  // All icons used in the codebase - declared here so TypeScript accepts the original imports
  export const IconSun: TablerIcon;
  export const IconMoon: TablerIcon;
  export const IconTruck: TablerIcon;
  export const IconBuilding: TablerIcon;
  export const IconRoute: TablerIcon;
  export const IconFileText: TablerIcon;
  export const IconUsers: TablerIcon;
  export const IconSettings: TablerIcon;
  export const IconLogout: TablerIcon;
  export const IconDashboard: TablerIcon;
  export const IconPlus: TablerIcon;
  export const IconRefresh: TablerIcon;
  export const IconTrash: TablerIcon;
  export const IconLock: TablerIcon;
  export const IconMail: TablerIcon;
  export const IconX: TablerIcon;
}