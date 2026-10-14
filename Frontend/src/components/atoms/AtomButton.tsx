import { Button, ButtonProps } from '@mantine/core';
import { ReactNode, MouseEventHandler } from 'react';

interface AtomButtonProps extends Omit<ButtonProps, 'children'> {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

export function AtomButton({
  children,
  onClick,
  type = 'button',
  variant = 'filled',
  color = 'navy',
  size = 'sm',
  radius = 'sm',
  fw = 600,
  ...props
}: AtomButtonProps) {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      radius={radius}
      fw={fw}
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
}