// src/app/groups/page.tsx
'use client';

import React from 'react';
import { useBudget } from '../../context/BudgetProvider';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress, Box, Alert, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

const GroupsPage: React.FC = () => {
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
        Your Groups
      </Typography>
      {/* Add New Group Button */}
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => router.push('/groups/new')}>
          Add New Group
        </Button>
      </Box>
      <List>
        {groups.map((group) => (
          <ListItem button key={group.id} onClick={() => router.push(`/groups/${group.id}`)}>
            <ListItemText primary={group.name} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default GroupsPage;
