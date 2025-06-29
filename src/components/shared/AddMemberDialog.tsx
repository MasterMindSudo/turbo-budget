// src/components/shared/AddMemberDialog.tsx
'use client';

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, RadioGroup, FormControlLabel, Radio } from '@mui/material';

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onAddMember: (emailOrName: string, type: 'online' | 'offline') => Promise<void>;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ open, onClose, onAddMember }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [memberType, setMemberType] = useState<'online' | 'offline'>('online');

  const handleSubmit = async () => {
    if (!value) {
      setError(memberType === 'online' ? 'Email is required.' : 'Name is required.');
      return;
    }
    setError(null);

    try {
      await onAddMember(value, memberType);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Member</DialogTitle>
      <DialogContent>
        <RadioGroup
          row
          value={memberType}
          onChange={(e) => setMemberType(e.target.value as 'online' | 'offline')}
        >
          <FormControlLabel value="online" control={<Radio />} label="Online User" />
          <FormControlLabel value="offline" control={<Radio />} label="Offline User" />
        </RadioGroup>
        <TextField
          autoFocus
          margin="dense"
          id={memberType === 'online' ? 'email' : 'name'}
          label={memberType === 'online' ? 'Email Address' : 'Name'}
          type={memberType === 'online' ? 'email' : 'text'}
          fullWidth
          variant="standard"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;
