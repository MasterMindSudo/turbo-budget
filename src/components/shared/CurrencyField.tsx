// src/components/shared/CurrencyField.tsx
'use client';

import React from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';

interface CurrencyFieldProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  currencySymbol?: string;
  value: number | '';
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CurrencyField: React.FC<CurrencyFieldProps> = ({
  currencySymbol = '$',
  value,
  onChange,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    // Allow empty string, numbers, and numbers with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      onChange?.(event);
    }
  };

  return (
    <TextField
      type="number" // Change to number to get proper numeric keyboard on all devices
      value={value}
      onChange={handleChange}
      InputProps={{
        startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
        inputProps: {
          step: "0.01" // Allow decimal steps
        }
      }}
      variant="standard"
      fullWidth
      {...props}
    />
  );
};

export default CurrencyField;