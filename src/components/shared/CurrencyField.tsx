// src/components/shared/CurrencyField.tsx
'use client';

import React from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';

interface CurrencyFieldProps extends TextFieldProps {
  currencySymbol?: string;
}

const CurrencyField: React.FC<CurrencyFieldProps> = ({
  currencySymbol = '$',
  onChange,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Allow empty string or numbers only (including decimal point)
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onChange?.(event);
    }
  };

  return (
    <TextField
      type="text" // Use text to allow partial input like "1." before "1.2", numeric keyboard will still show on mobile
      onChange={handleChange}
      InputProps={{
        startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
      }}
      variant="standard"
      fullWidth
      {...props}
    />
  );
};

export default CurrencyField;