// src/components/shared/GradientButton.tsx
'use client';

import React from 'react';
import { Button, ButtonProps, styled } from '@mui/material';

interface GradientButtonProps extends ButtonProps {
  startColor: string;
  endColor: string;
}

const GradientButton = styled(
  ({ startColor, endColor, ...other }: GradientButtonProps) => (
    <Button {...other} />
  ),
)<GradientButtonProps>(({ startColor, endColor, theme }) => ({
  background: `linear-gradient(45deg, ${startColor} 30%, ${endColor} 90%)`,
  border: 0,
  borderRadius: 12, // From theme.components.MuiButton
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: `0 3px 5px 2px rgba(255, 105, 135, .3)`, // Generic shadow, can be customized
  fontWeight: 'bold',
  textTransform: 'none', // Ensure text is not all caps
  '&:hover': {
    opacity: 0.9,
    // When using `background` for gradient, `backgroundColor` for hover doesn't blend well.
    // Consider adding a subtle transform or different gradient on hover.
  },
}));

export default GradientButton;