/** @format */

import { DateTimePicker, DateTimePickerProps } from "@mantine/dates";
import { CSSProperties, useRef, useState } from "react";

interface EditableDateTimePickerProps extends Omit<
  DateTimePickerProps,
  "styles" | "readOnly"
> {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  lockWhenFilled?: boolean;
}

function getInputStyle(isLocked: boolean, disabled: boolean): CSSProperties {
  return {
    backgroundColor: isLocked
      ? "var(--mantine-color-gray-1)"
      : "var(--mantine-color-body)",
    borderColor: isLocked
      ? "var(--mantine-color-gray-4)"
      : "var(--mantine-color-blue-6)",
    color: isLocked
      ? "var(--mantine-color-dimmed)"
      : "var(--mantine-color-text)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition:
      "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
  };
}

export default function EditableDateTimePicker({
  label,
  placeholder,
  disabled = false,
  clearable = true,
  valueFormat = "DD/MM/YYYY HH:mm",
  lockWhenFilled = false,
  timePickerProps,
  popoverProps,
  onFocus,
  onClick,
  onDropdownClose,
  ...rest
}: EditableDateTimePickerProps) {
  const hasInitialValue =
    rest.value !== null && rest.value !== undefined && rest.value !== "";

  const [isEditing, setIsEditing] = useState<boolean>(() => {
    if (disabled) return false;
    if (lockWhenFilled) return !hasInitialValue;
    return false;
  });

  // Separate state so popovers never auto-open on mount
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const openedOnFocusRef = useRef(false);
  const isLocked = disabled || !isEditing;

  const mergedTimePickerProps: DateTimePickerProps["timePickerProps"] = {
    withDropdown: true,
    format: "24h",
    ...timePickerProps,
    popoverProps: { withinPortal: false, ...timePickerProps?.popoverProps },
  };

  const handleClose = () => {
    onDropdownClose?.();
    popoverProps?.onClose?.();
    openedOnFocusRef.current = false;
    setIsPopoverOpen(false);
    setIsEditing(false);
  };

  return (
    <DateTimePicker
      label={label}
      {...rest}
      placeholder={placeholder}
      clearable={clearable}
      valueFormat={valueFormat}
      timePickerProps={mergedTimePickerProps}
      popoverProps={{
        ...popoverProps,
        opened: !disabled && isPopoverOpen,
        onClose: handleClose,
      }}
      disabled={disabled}
      readOnly={isLocked}
      onFocus={(event) => {
        onFocus?.(event);
        if (!disabled) {
          openedOnFocusRef.current = true;
          setIsEditing(true);
          setIsPopoverOpen(true);
        }
      }}
      onClick={(event) => {
        onClick?.(event);
        if (disabled) return;
        if (openedOnFocusRef.current) {
          openedOnFocusRef.current = false;
          return;
        }
        setIsEditing(true);
        setIsPopoverOpen((prev) => !prev);
      }}
      styles={{ input: getInputStyle(isLocked, disabled) }}
    />
  );
}
