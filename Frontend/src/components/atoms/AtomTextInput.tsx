import React from 'react';
import { TextInput, type TextInputProps } from '@mantine/core';

interface AtomTexxtInputProps extends TextInputProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

export const AtomTextInput: React.FC<AtomTexxtInputProps> = ({ label, placeholder, required = false, ...rest }) => {
  return (<TextInput
    label={label}
    placeholder={placeholder}
    required={required}
    {...rest} />
  )
}