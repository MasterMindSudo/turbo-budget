// src/app/groups/[groupId]/expense/new/page.tsx
'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBudget, Expense } from '../../../../../../context/BudgetProvider';
import ExpenseForm from '../../../../../../components/shared/ExpenseForm';
import { Container, Typography, CircularProgress, Box, Alert } from '@mui/material';

const NewExpensePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const groupId = params?.groupId as string;
  const { state, getGroupById, addExpense } = useBudget();
  const { loading, error } = state;

  const currentGroup = getGroupById(groupId);

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'currency'> & { currency?: string }) => {
    if (!groupId) {
      console.error('Group ID is missing.');
      return;
    }
    addExpense(expenseData, groupId);
    router.back();
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='text.secondary'>
          Loading group data...
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      </Container>
    );
  }

  if (!currentGroup) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          Group Not Found. The group with ID &quot;{groupId}&quot; does not exist or you do not have access.
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return <ExpenseForm group={currentGroup} onSubmit={handleAddExpense} mode="new" />;
};

export default NewExpensePage;
