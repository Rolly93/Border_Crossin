import { ActionIcon, ActionIconProps } from "@mantine/core";
import { TablerIcon } from "@tabler/icons-react";
import React from "react";

interface AtomActionIconProps extends ActionIconProps {
  icon: TablerIcon;
  iconSize?: number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string
}
export function AtmoAction({ icon: Icon, iconSize = 18, variant = 'subtle', color = 'blue', onClick, title, ...props }: AtomActionIconProps) {

  return (

    <ActionIcon
      variant={variant}
      color={color}
      title={title}
      onClick={onClick}
      {...props}
    >
      <Icon size={18} />
    </ActionIcon>
  )

}