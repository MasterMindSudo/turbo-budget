'use client';

import React from 'react';
import { useBudget } from '../../context/BudgetProvider';
import withAuth from '../../components/withAuth';
import { Container, Typography, Box, Card, CardContent, Button, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const { state, setActiveGroup } = useBudget();
  const router = useRouter();

  const handleGroupClick = (groupId: string) => {
    setActiveGroup(groupId);
    router.push(`/groups/${groupId}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Your Groups
        </Typography>
        <Button variant="contained" onClick={() => router.push('/groups/new')}>
          New Group
        </Button>
      </Box>
      {state.groups.length > 0 ? (
        <Grid container spacing={3}>
          {state.groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Card
                sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                onClick={() => handleGroupClick(group.id)}>
                <CardContent>
                  <Typography variant="h5" component="div">{group.name}</Typography>
                  <Typography color="text.secondary">{group.members.length} members</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>You are not a part of any groups yet.</Typography>
      )}
    </Container>
  );
};

export default withAuth(DashboardPage);
