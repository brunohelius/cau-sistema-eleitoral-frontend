import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface RichTextEditorProps extends Omit<TextFieldProps, 'variant' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  minHeight,
  ...props
}) => {
  return (
    <TextField
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      variant="outlined"
      multiline
      rows={minHeight ? Math.ceil(minHeight / 24) : 6}
      fullWidth
    />
  );
};