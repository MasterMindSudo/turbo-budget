'use client';

import React, { useState } from 'react';
import { useBudget } from '../../../../context/BudgetProvider';
import withAuth from '../../../../components/withAuth';
import { Container, Typography, Box, TextField, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';

const NewGroupPage = () => {
  const [groupName, setGroupName] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const { addGroup } = useBudget();
  const router = useRouter();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      const newGroupId = await addGroup(groupName, baseCurrency);
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
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="base-currency-label">Base Currency</InputLabel>
          <Select
            labelId="base-currency-label"
            id="base-currency-select"
            value={baseCurrency}
            label="Base Currency"
            onChange={(e) => setBaseCurrency(e.target.value)}
          >
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
            <MenuItem value="GBP">GBP</MenuItem>
            <MenuItem value="JPY">JPY</MenuItem>
            <MenuItem value="AUD">AUD</MenuItem>
            <MenuItem value="CAD">CAD</MenuItem>
            <MenuItem value="CHF">CHF</MenuItem>
            <MenuItem value="CNY">CNY</MenuItem>
            <MenuItem value="HKD">HKD</MenuItem>
            <MenuItem value="SGD">SGD</MenuItem>
          </Select>
        </FormControl>
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
