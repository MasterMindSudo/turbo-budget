// src/app/budget/page.tsx
'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const BudgetPage: React.FC = () => {
  const router = useRouter();

  return (
    <Box sx={{ pb: 8 }}>
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', mr: 5 }}>
            Budget
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.primary" gutterBottom>
          Budget Page (To Be Implemented)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page will show budgeting insights, forecasts, and visual breakdowns.
        </Typography>
      </Container>
    </Box>
  );
};

export default BudgetPage;