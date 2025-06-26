// src/styles/theme.ts
'use client';

import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700'] });

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFB300', // Amber 600
    },
    secondary: {
      main: '#00B0FF', // Light Blue 400
    },
    success: {
      main: '#4CAF50', // Green for "Divide the Expense" switch
    },
    warning: {
      main: '#FFB300', // Reusing primary color for "Create virtual accounts" link
    },
    background: {
      default: '#f0f2f5', // Consistent with global CSS
      paper: '#FFFFFF', // For cards, sheets
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true, // Disable ripple globally for a cleaner mobile feel
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none', // Keep natural casing
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important', // Ensure border-radius applies to ToggleButton
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Apply border-radius to FAB
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Apply to components that use Paper, like Dialogs, Popovers, etc.
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard', // Default to standard as per screenshots
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'standard',
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        variant: 'standard',
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 8,
          '& .MuiSwitch-track': {
            borderRadius: 22 / 2,
            opacity: 1,
            backgroundColor: 'rgba(0,0,0,.25)',
            boxSizing: 'border-box',
          },
          '& .MuiSwitch-thumb': {
            boxShadow: 'none',
            width: 16,
            height: 16,
            margin: 2,
          },
        },
      },
    },
  },
});

export default theme;