/** @format */

import { TextInput, TextInputProps } from "@mantine/core";
import { CSSProperties, useRef, useState } from "react";

interface EditableTextInputsProps extends Omit<
  TextInputProps,
  "styles" | "readOnly"
> {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  lockWhenFilled?: boolean;
}

function hasNonEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

function getInputStyle(
  isLocked: boolean,
  disabled: boolean,
  hasValue: boolean,
): CSSProperties {
  const isEmptyAvailable = !isLocked && !hasValue;

  return {
    backgroundColor: isLocked
      ? "var(--mantine-color-gray-1)"
      : "var(--mantine-color-body)",
    borderColor: isLocked
      ? "var(--mantine-color-gray-4)"
      : isEmptyAvailable
        ? "var(--mantine-color-blue-4)"
        : "var(--mantine-color-blue-6)",
    color: isLocked
      ? "var(--mantine-color-dimmed)"
      : "var(--mantine-color-text)",
    cursor: disabled ? "not-allowed" : isLocked ? "pointer" : "text",
    transition:
      "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
  };
}

export default function EditableTextInput({
  label,
  placeholder,
  disabled = false,
  lockWhenFilled = false,
  onFocus,
  onClick,
  onBlur,
  ...rest
}: EditableTextInputsProps) {
  const hasValue = hasNonEmptyValue(rest.value);

  const [isEditing, setIsEditing] = useState<boolean>(() => {
    if (disabled) return false;
    if (lockWhenFilled) return !hasValue;
    return false;
  });

  const openedOnFocusRef = useRef(false);
  const isLocked = disabled || !isEditing;

  return (
    <TextInput
      label={label}
      {...rest}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={isLocked}
      onFocus={(event) => {
        onFocus?.(event);
        if (!disabled && !isEditing) {
          openedOnFocusRef.current = true;
          setIsEditing(true);
        }
      }}
      onClick={(event) => {
        onClick?.(event);
        if (disabled) return;
        openedOnFocusRef.current = false;
        setIsEditing(true);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        openedOnFocusRef.current = false;

        if (lockWhenFilled) {
          const currentVal = event.currentTarget?.value ?? rest.value;
          setIsEditing(!hasNonEmptyValue(currentVal));
        } else {
          setIsEditing(false);
        }
      }}
      styles={{ input: getInputStyle(isLocked, disabled, hasValue) }}
    />
  );
}
