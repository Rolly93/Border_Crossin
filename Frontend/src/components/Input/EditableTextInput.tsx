import { CheckIcon, TextInput } from "@mantine/core";
import { useState } from "react";

interface EditableTextInputsProps {
    label: string;
    placeholder?: string;
    formProps: any;
    disabled?: boolean;
}

export default function EditableTextInput({
    label,
    placeholder,
    disabled = false,
    formProps,
}: EditableTextInputsProps) {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <TextInput
            label={label}
            {...formProps}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={disabled || !isEditing}
            onDoubleClick={() => {
                if (!disabled) {
                    setIsEditing(true);
                }
            }}
            onBlur={(event) => {
                formProps?.onBlur?.(event);
                setIsEditing(false);
            }}
            rightSection={
                !disabled && isEditing ? (
                    <CheckIcon size={14} color="blue" />
                ) : (
                    <CheckIcon size={14} color="green" style={{ opacity: 0.03 }} />
                )
            }
        />
    );
}