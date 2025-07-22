// src/app/groups/[groupId]/expense/[expenseId]/edit/page.tsx
'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBudget, Expense } from '../../../../../../../context/BudgetProvider';
import ExpenseForm from '../../../../../../../components/shared/ExpenseForm';
import { Container, Typography, CircularProgress, Box } from '@mui/material';

const EditExpensePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const groupId = params?.groupId as string;
  const expenseId = params?.expenseId as string;

  // Note: getExpenseById and updateExpense must be implemented in your BudgetProvider context.
  const { getGroupById, getExpenseById, updateExpense } = useBudget();

  const currentGroup = getGroupById(groupId);
  const expenseToEdit = getExpenseById(expenseId);

  const handleUpdateExpense = (expenseData: Omit<Expense, 'id' | 'currency'> & { currency?: string }) => {
    if (!groupId || !expenseId) {
      console.error('Group or Expense ID is missing.');
      return;
    }
    updateExpense({ ...expenseData, id: expenseId, groupId, currency: 'USD' });
    router.back();
  };

  if (!currentGroup || !expenseToEdit) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='text.secondary'>
          Loading expense data...
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      </Container>
    );
  }

  return (
    <ExpenseForm
      group={currentGroup}
      initialExpense={expenseToEdit}
      onSubmit={handleUpdateExpense}
      mode="edit"
    />
  );
};

export default EditExpensePage;