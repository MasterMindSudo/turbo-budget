// src/app/expense/new/page.tsx
'use client';

import React from 'react';
import { useBudget } from '../../../context/BudgetProvider';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress, Box, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';

const NewExpensePage: React.FC = () => {
  const { state } = useBudget();
  const { groups, loading, error } = state;
  const router = useRouter();

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading groups...</Typography>
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

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Select a Group
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Please select a group to add an expense to.
      </Typography>
      <List>
        {groups.map((group) => (
          <ListItem button key={group.id} onClick={() => router.push(`/groups/${group.id}/expense/new`)}>
            <ListItemText primary={group.name} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default NewExpensePage;
