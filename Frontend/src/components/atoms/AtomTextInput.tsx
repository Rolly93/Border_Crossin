import react from 'react'
import { TextInput, TextInputProps } from '@mantine/core'
import React from 'react';

interface AtomTexxtInputProps extends TextInputProps {
  label: string;
  placeholder?: string;
  required?: boolean
}

export const AtomTextInput: React.FC<AtomTexxtInputProps> = ({ label, placeholder, required = false, ...rest }) => {
  return (<TextInput
    label={label}
    placeholder={placeholder}
    required={required}
    {...rest} />
  )
}