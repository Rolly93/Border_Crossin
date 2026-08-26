import { Button, ButtonProps } from "@mantine/core";
import { Children, ReactNode } from "react";

interface AtomButtonProps extends ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function AtomButton({
  children,
  onClick,
  type = "button",
  variant = "filled",
  color = "dark",
  ...props
}: AtomButtonProps) {
  return (
    <Button type={type} variant={variant} color={color} onClick={onClick} {...props} >
      {children}
    </Button>
  );
}