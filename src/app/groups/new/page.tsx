'use client';

import React, { useState } from 'react';
import { useBudget } from '../../../context/BudgetProvider';
import withAuth from '../../../components/withAuth';
import { Container, Typography, Box, TextField, Button, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';

const NewGroupPage = () => {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addGroup } = useBudget();
  const router = useRouter();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      const newGroupId = await addGroup(groupName);
      if (newGroupId) {
        router.push(`/groups/${newGroupId}`);
      } else {
        // Handle the case where group creation fails
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create a New Group
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          fullWidth
          label="Group Name"
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleCreateGroup}
          disabled={loading || !groupName.trim()}
          sx={{ position: 'relative' }}
        >
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
          Create Group
        </Button>
      </Box>
    </Container>
  );
};

export default withAuth(NewGroupPage);
