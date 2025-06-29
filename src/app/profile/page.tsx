'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBudget } from '../../context/BudgetProvider';
import withAuth from '../../components/withAuth';
import { Container, Typography, Box, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { updateProfile } from 'firebase/auth';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { updateUserDisplayName } = useBudget();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user || !displayName.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile(user, { displayName });
      await updateUserDisplayName(user.uid, displayName);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Profile
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          fullWidth
          label="Email Address"
          variant="outlined"
          value={user?.email || ''}
          disabled
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Display Name"
          variant="outlined"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{ mb: 2 }}
        />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Button
          variant="contained"
          onClick={handleUpdateProfile}
          disabled={loading || !displayName.trim() || displayName === user?.displayName}
          sx={{ position: 'relative', mr: 2 }}
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
          Update Profile
        </Button>
        <Button
          variant="outlined"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default withAuth(ProfilePage);
