// src/components/shared/ExpenseForm.tsx
'use client';

import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Container, Box, TextField, ToggleButton, ToggleButtonGroup, Button, InputAdornment, Grid, Switch, FormControlLabel, Select, MenuItem, Autocomplete, Chip, List, ListItem, Avatar, Checkbox } from '@mui/material';
import { ArrowBack, CameraAlt, FolderOpen, AddCircle, Edit as EditIcon } from '@mui/icons-material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useRouter } from 'next/navigation';
import MemberListItem from './MemberListItem';
import CurrencyField from './CurrencyField';
import moment, { Moment } from 'moment';
import { categories } from '../../lib/data';
import { Group, Expense } from '../../context/BudgetProvider';

import { useAuth } from '../../context/AuthContext';
import { Timestamp } from 'firebase/firestore';

interface ExpenseFormProps {
  group: Group;
  initialExpense?: Omit<Expense, 'id'> & { id?: string };
  onSubmit: (expenseData: Omit<Expense, 'id' | 'currency'> & { currency?: string }) => void;
  mode: 'new' | 'edit';
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ group, initialExpense, onSubmit, mode }) => {
  const router = useRouter();
  const { user } = useAuth();

  const [amount, setAmount] = React.useState<number | ''>(initialExpense?.amount || '');
  const [receiptImage, setReceiptImage] = React.useState<File | null>(null);
  const [aiAutoFill, setAiAutoFill] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<typeof categories[0] | null>(
    categories.find(cat => cat.name === initialExpense?.category) || categories.find(cat => cat.id === 'food') || null
  );
  const [expenseDate, setExpenseDate] = React.useState<Moment | null>(initialExpense ? moment((initialExpense.date as Timestamp)?.toDate()) : moment());
  const [note, setNote] = React.useState(initialExpense?.note || '');
  const [isRecurring, setIsRecurring] = React.useState(initialExpense?.isRecurring || false);
  const [divideExpense, setDivideExpense] = React.useState(initialExpense ? initialExpense.participants.length > 0 : true);
  const [splitMode, setSplitMode] = React.useState<string | null>('Even');
  const [participants, setParticipants] = React.useState<
    { memberId: string; share: number; displayName: string; avatarUrl?: string }[]
  >([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = React.useState<string[]>([]);
  const [paidBy, setPaidBy] = React.useState<string | null>(initialExpense?.paidBy || null);

  React.useEffect(() => {
    if (group) {
      const initialParticipants = group.members.map(member => {
        const existingParticipant = initialExpense?.participants.find(p => p.memberId === member.id);
        return {
          memberId: member.id,
          displayName: member.displayName,
          avatarUrl: member.avatarUrl,
          share: existingParticipant?.share || 0,
        };
      });
      setParticipants(initialParticipants);

      if (initialExpense) {
        setSelectedParticipantIds(initialExpense.participants.map(p => p.memberId));
        setPaidBy(initialExpense.paidBy);
        // TODO: A more robust solution would be to determine the split mode from the initialExpense data.
        // For now, it defaults to 'Even', and the useEffect below will calculate shares if applicable.
      } else {
        setSelectedParticipantIds(group.members.map(m => m.id));
        setPaidBy(user?.uid || group.members[0]?.id || null);
      }
    }
  }, [group, initialExpense, user?.uid]);

  React.useEffect(() => {
    if (splitMode === 'Even' && typeof amount === 'number' && amount > 0) {
      const numberOfActiveParticipants = selectedParticipantIds.length;
      if (numberOfActiveParticipants > 0) {
        const evenShare = amount / numberOfActiveParticipants;
        setParticipants(prev =>
          prev.map(p => ({
            ...p,
            share: selectedParticipantIds.includes(p.memberId) ? evenShare : 0,
          }))
        );
      } else {
        setParticipants(prev => prev.map(p => ({ ...p, share: 0 })));
      }
    }
  }, [splitMode, amount, selectedParticipantIds]);

  const handleSplitModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string | null,
  ) => {
    if (newMode !== null) {
      setSplitMode(newMode);
      if (newMode === 'Even' && group) {
        setSelectedParticipantIds(group.members.map(m => m.id));
      } else if (newMode !== 'Even') {
        setParticipants(prev => prev.map(p => ({ ...p, share: 0 })));
      }
    }
  };

  const handleToggleParticipant = (memberId: string) => {
    setSelectedParticipantIds(prevSelected =>
      prevSelected.includes(memberId)
        ? prevSelected.filter(id => id !== memberId)
        : [...prevSelected, memberId]
    );
  };

  const handleParticipantShareChange = (memberId: string, value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    setParticipants(prev =>
      prev.map(p => (p.memberId === memberId ? { ...p, share: isNaN(numericValue) ? 0 : numericValue } : p))
    );
  };

  const handlePaidByChange = (memberId: string, value: string | number) => {
    setPaidBy(memberId);
  };

  const handleSubmit = () => {
    if (typeof amount !== 'number' || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!paidBy) {
      alert('Please select who paid.');
      return;
    }

    let actualParticipants: { memberId: string; share: number }[] = [];
    if (divideExpense) {
        if (splitMode === 'Even') {
            const numberOfActiveParticipants = selectedParticipantIds.length;
            if (numberOfActiveParticipants === 0) {
                alert('At least one participant must be selected for an even split.');
                return;
            }
            const evenShare = amount / numberOfActiveParticipants;
            actualParticipants = selectedParticipantIds.map(id => ({ memberId: id, share: evenShare }));
        } else {
             actualParticipants = participants.filter(p => p.share > 0);
             if (splitMode === 'Amount' && actualParticipants.reduce((sum, p) => sum + p.share, 0) !== amount) {
                alert('Total shares do not match the expense amount. Please adjust for Amount split mode.');
                return;
            }
        }
    }
    
    const receiptUrl = receiptImage ? `gs://your-firebase-bucket/receipts/${receiptImage.name}` : initialExpense?.receiptUrl;

    const newExpenseData: Omit<Expense, 'id' | 'currency'> & { currency?: string } = {
      groupId: group.id,
      title: selectedCategory?.name || 'New Expense',
      amount: amount,
      paidBy: paidBy,
      date: Timestamp.fromDate(expenseDate ? expenseDate.toDate() : new Date()),
      participants: actualParticipants.map(p => ({ memberId: p.memberId, share: p.share })),
      category: selectedCategory?.id,
      note: note,
      isRecurring: isRecurring,
    };

    if (receiptUrl) {
      newExpenseData.receiptUrl = receiptUrl;
    }

    onSubmit(newExpenseData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ pb: 16 }}>
        <AppBar position='static' color='inherit' elevation={1}>
          <Toolbar>
            <IconButton edge='start' color='inherit' aria-label='back' onClick={() => router.back()}>
              <ArrowBack />
            </IconButton>
            <Typography variant='h6' component='div' sx={{ flexGrow: 1, textAlign: 'center', mr: 5 }}>
              {mode === 'new' ? 'New Expense' : 'Edit Expense'}
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth='sm' sx={{ py: 2 }}>
          <Typography variant='h6' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Amount</Typography>
          <CurrencyField
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder='0.00'
            inputProps={{ style: { fontSize: '2rem', textAlign: 'right', fontWeight: 'bold' } }}
            sx={{ mb: 3 }}
            fullWidth
            variant="standard"
          />

          <Typography variant='body1' sx={{ mb: 1, color: 'text.secondary' }}>Receipt Image</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton color='primary' sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 2, mr: 1, p: 1.5 }} component='label'>
              <CameraAlt fontSize='large' />
              <input type='file' accept='image/*' capture='environment' hidden onChange={(e) => e.target.files && setReceiptImage(e.target.files[0])} />
            </IconButton>
            <IconButton color='primary' sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 2, mr: 2, p: 1.5 }} component='label'>
              <FolderOpen fontSize='large' />
              <input type='file' accept='image/*' hidden onChange={(e) => e.target.files && setReceiptImage(e.target.files[0])} />
            </IconButton>
            {receiptImage && <Typography variant='body2' sx={{ mr: 2 }}>{receiptImage.name}</Typography>}

            <FormControlLabel
              control={<Switch checked={aiAutoFill} onChange={(e) => setAiAutoFill(e.target.checked)} color='primary' disabled />}
              label={
                <Box>
                  <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center' }}>
                    AI Auto-Fill
                    <Chip label='5 left this month' size='small' sx={{ ml: 1, height: 20 }} />
                  </Typography>
                </Box>
              }
              labelPlacement='start'
              sx={{ m: 0, ml: 'auto' }}
            />
          </Box>

          <Typography variant='body1' sx={{ mb: 1, color: 'text.secondary' }}>What kind of expense?</Typography>
          <Autocomplete
            value={selectedCategory}
            onChange={(_event, newValue) => setSelectedCategory(newValue)}
            options={categories}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (<Box component='li' sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}><span role='img' aria-label={option.name} style={{ marginRight: 8 }}>{option.emoji}</span>{option.name}</Box>)}
            renderInput={(params) => (<TextField {...params} label='Category' variant='standard' InputProps={{ ...params.InputProps, endAdornment: (<InputAdornment position='end'>{params.InputProps.endAdornment}<IconButton size='small'><EditIcon fontSize='small' /></IconButton></InputAdornment>),}}/>)}
            sx={{ mb: 2 }}
          />

          <DatePicker label='Day' value={expenseDate} onChange={(newValue) => setExpenseDate(newValue)} slotProps={{ textField: { variant: 'standard', fullWidth: true } }} sx={{ mb: 2 }} />
          <TextField label='Note' placeholder='Place / Use' value={note} onChange={(e) => setNote(e.target.value)} variant='standard' fullWidth sx={{ mb: 3 }} />
          <FormControlLabel control={<Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} color='primary' />} label='Recurring' labelPlacement='start' sx={{ mr: 'auto', ml: 0, mb: 2, width: '100%', justifyContent: 'space-between' }} />
          {isRecurring && <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>Recurring options will appear here.</Typography>}
          <FormControlLabel control={<Switch checked={divideExpense} onChange={(e) => setDivideExpense(e.target.checked)} color='success'/>} label='Divide the Expense' labelPlacement='start' sx={{ mr: 'auto', ml: 0, mb: 3, width: '100%', justifyContent: 'space-between' }} />

          {divideExpense && (
            <>
              <Typography variant='h6' sx={{ mb: 1 }}>How should we divide this?</Typography>
              <ToggleButtonGroup value={splitMode} exclusive onChange={handleSplitModeChange} fullWidth color='primary' sx={{ mb: 2, borderRadius: '12px !important' }}>
                <ToggleButton value='Even'>Even</ToggleButton>
                <ToggleButton value='Ratio'>Ratio</ToggleButton>
                <ToggleButton value='Amount'>Amount</ToggleButton>
                <ToggleButton value='Joint'>Joint</ToggleButton>
              </ToggleButtonGroup>

              <List dense disablePadding>
                {participants.map((member) => (
                  <ListItem key={member.memberId} disablePadding sx={{ py: 0.5 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={member.avatarUrl} sx={{ mr: 1.5 }} />
                          <Typography variant="body1">{member.displayName}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs="auto">
                        {splitMode === 'Even' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Typography sx={{ mr: 1, minWidth: '60px', textAlign: 'right' }}>
                              {`$${member.share.toFixed(2)}`}
                            </Typography>
                            <Checkbox
                              checked={selectedParticipantIds.includes(member.memberId)}
                              onChange={() => handleToggleParticipant(member.memberId)}
                            />
                          </Box>
                        ) : (
                          <TextField
                            size="small"
                            sx={{ width: '120px' }}
                            value={member.share || ''}
                            onChange={(e) => handleParticipantShareChange(member.memberId, e.target.value === '' ? 0 : parseFloat(e.target.value))}
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">{splitMode === 'Ratio' ? '%' : '$'}</InputAdornment>,
                            }}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
              <Typography variant='body2' color='warning.main' sx={{ mt: 1, mb: 3, cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => console.log('Create virtual accounts')}>
                <AddCircle sx={{ mr: 0.5 }} fontSize='small' /> Create virtual accounts
              </Typography>
            </>
          )}

          <Typography variant='h6' sx={{ mb: 1 }}>Did somebody cover this temporarily?</Typography>
          <List dense disablePadding>
            {group.members
              .slice()
              .sort((a, b) => {
                if (a.id === user?.uid) return -1;
                if (b.id === user?.uid) return 1;
                return a.displayName.localeCompare(b.displayName);
              })
              .map((member) => (
              <MemberListItem key={member.id} id={member.id} displayName={member.displayName} avatarUrl={member.avatarUrl} mode='radio' onChange={handlePaidByChange} isSelected={paidBy === member.id} currencySymbol='$' value={amount || 0} />
            ))}
            <MemberListItem id='joint-account' displayName='Joint Account' avatarUrl='/AccountBalanceWallet.svg' mode='radio' onChange={handlePaidByChange} isSelected={paidBy === 'joint-account'} currencySymbol='$' value={amount || 0} />
          </List>
          <Typography variant='body2' color='warning.main' sx={{ mt: 1, mb: 3, cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => console.log('Create virtual accounts for temporary cover')}>
            <AddCircle sx={{ mr: 0.5 }} fontSize='small' /> Create virtual accounts
          </Typography>
        </Container>

        <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'background.paper', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', display: 'flex', gap: 2, zIndex: 1000 }}>
          <Button variant='outlined' fullWidth sx={{ borderRadius: 12, py: 1.5, borderColor: 'grey.300', color: 'text.primary' }} onClick={() => router.back()}>Close</Button>
          <Button variant='contained' fullWidth sx={{ borderRadius: 12, py: 1.5, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }} onClick={handleSubmit}>
            {mode === 'new' ? 'Add' : 'Save'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ExpenseForm;