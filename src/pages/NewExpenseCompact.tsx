import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Container, Box, TextField, ToggleButton, ToggleButtonGroup, Button, InputAdornment, Grid, List } from '@mui/material';
import { ArrowBack, AddCircle } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import MemberListItem from '../components/shared/MemberListItem';
import CurrencyField from '../components/shared/CurrencyField';
import { useBudget } from '../BudgetContext';

const NewExpenseCompact: React.FC = () => {
  const navigate = useNavigate();
  const { id: groupId } = useParams<{ id: string }>();
  const { currentGroup, addExpense } = useBudget();

  const [amount, setAmount] = React.useState<number | ''>('');
  const [splitMode, setSplitMode] = React.useState<string | null>('Even');
  const [participants, setParticipants] = React.useState<
    { memberId: string; share: number; displayName: string; avatarUrl?: string }[]
  >([]);
  const [paidBy, setPaidBy] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentGroup) {
      // Initialize participants for splitting based on group members
      const initialParticipants = currentGroup.members.map(member => ({
        memberId: member.id,
        displayName: member.displayName,
        avatarUrl: member.avatarUrl,
        share: 0,
      }));
      setParticipants(initialParticipants);
      // Set the current user as the default payer if available
      setPaidBy(initialParticipants[0]?.memberId || null); // First member as default payer
    }
  }, [currentGroup]);

  React.useEffect(() => {
    if (splitMode === 'Even' && typeof amount === 'number' && amount > 0 && participants.length > 0) {
      const evenShare = amount / participants.length;
      setParticipants(prev => prev.map(p => ({ ...p, share: evenShare })));
    }
  }, [splitMode, amount, participants.length]);


  const handleSplitModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string | null,
  ) => {
    if (newMode !== null) {
      setSplitMode(newMode);
      // Reset shares when changing split mode, especially if moving from Even
      if (newMode !== 'Even') {
        setParticipants(prev => prev.map(p => ({ ...p, share: 0 })));
      }
    }
  };

  const handleParticipantShareChange = (memberId: string, value: number | string) => {
    setParticipants(prev =>
      prev.map(p => (p.memberId === memberId ? { ...p, share: typeof value === 'number' ? value : 0 } : p))
    );
  };

  const handlePaidByChange = (memberId: string, value: string) => {
    setPaidBy(value);
  };

  const handleAddExpense = () => {
    if (!groupId) {
      alert('Group not selected!');
      return;
    }
    if (typeof amount !== 'number' || amount <= 0) {
      alert('Please enter a valid amount!');
      return;
    }
    if (!paidBy) {
      alert('Please select who paid!');
      return;
    }
    // Filter participants with non-zero share or all if even split
    const actualParticipants = participants.filter(p => p.share > 0);

    if (actualParticipants.length === 0 && splitMode !== 'Even') { // If not even, and no participants set manually
      alert('Please specify how the expense is divided!');
      return;
    }

    // Prepare data for addExpense
    const newExpense = {
      title: 'New Expense', // Will be updated on full form or default
      amount: amount,
      currency: 'USD', // Default currency
      paidBy: paidBy,
      date: new Date(),
      participants: actualParticipants.map(p => ({ memberId: p.memberId, share: p.share })),
      // receiptUrl: undefined, // Not in compact form
      // category: undefined,
      // note: undefined,
      // isRecurring: false,
    };
    addExpense(newExpense, groupId);
    navigate(-1); // Go back after adding
  };

  if (!currentGroup) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Group data not available.
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 8 }}> {/* Padding for fixed bottom buttons */}
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', mr: 5 }}>
            New Expense
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* Amount */}
        <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Amount</Typography>
        <CurrencyField
          value={amount}
          onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
          placeholder="0.00"
          inputProps={{ style: { fontSize: '2rem', textAlign: 'right', fontWeight: 'bold' } }}
          sx={{ mb: 3 }}
          fullWidth
          variant="standard"
        />

        {/* What kind of expense? - Link to full form */}
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer', mb: 3 }}
          onClick={() => navigate(`/groups/${groupId}/expense/new`)}
        >
          What kind of expense?
        </Typography>

        {/* Split Section */}
        <Typography variant="h6" sx={{ mb: 1 }}>Split</Typography>
        <ToggleButtonGroup
          value={splitMode}
          exclusive
          onChange={handleSplitModeChange}
          fullWidth
          color="primary"
          sx={{ mb: 2, borderRadius: '12px !important' }} // Ensure rounded corners
        >
          <ToggleButton value="Even">Even</ToggleButton>
          <ToggleButton value="Ratio">Ratio</ToggleButton>
          <ToggleButton value="Amount">Amount</ToggleButton>
          <ToggleButton value="Joint">Joint</ToggleButton>
        </ToggleButtonGroup>

        <List dense disablePadding>
          {participants.map((member) => (
            <MemberListItem
              key={member.memberId}
              id={member.memberId}
              displayName={member.displayName}
              avatarUrl={member.avatarUrl}
              value={splitMode === 'Even' ? (typeof amount === 'number' && participants.length > 0 ? amount / participants.length : 0) : member.share}
              onChange={handleParticipantShareChange}
              mode={splitMode === 'Even' ? 'display' : 'input'} // Only allow input if not Even
              currencySymbol="$"
            />
          ))}
        </List>
        <Typography
          variant="body2"
          color="warning.main"
          sx={{ mt: 1, mb: 3, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => console.log('Create virtual accounts')}
        >
          <AddCircle sx={{ mr: 0.5 }} fontSize="small" /> Create virtual accounts
        </Typography>


        {/* Did somebody cover this temporarily? */}
        <Typography variant="h6" sx={{ mb: 1 }}>Did somebody cover this temporarily?</Typography>
        <List dense disablePadding>
          {currentGroup.members.map((member) => (
            <MemberListItem
              key={member.id}
              id={member.id}
              displayName={member.displayName}
              avatarUrl={member.avatarUrl}
              mode="radio"
              onChange={handlePaidByChange}
              isSelected={paidBy === member.id}
              currencySymbol="$" // Display symbol next to amount
              value={amount} // Show full amount next to payer
            />
          ))}
          <MemberListItem
            id="joint-account"
            displayName="Joint Account"
            avatarUrl="/public/AccountBalanceWallet.svg" // Placeholder for joint account avatar
            mode="radio"
            onChange={handlePaidByChange}
            isSelected={paidBy === 'joint-account'}
            currencySymbol="$"
            value={0}
          />
        </List>
        <Typography
          variant="body2"
          color="warning.main"
          sx={{ mt: 1, mb: 3, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => console.log('Create virtual accounts for temporary cover')}
        >
          <AddCircle sx={{ mr: 0.5 }} fontSize="small" /> Create virtual accounts
        </Typography>

      </Container>

      {/* Fixed Bottom Action Buttons */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: 'background.paper',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: 2,
          zIndex: 1000,
        }}
      >
        <Button
          variant="outlined"
          fullWidth
          sx={{ borderRadius: 12, py: 1.5, borderColor: 'grey.300', color: 'text.primary' }}
          onClick={() => navigate(-1)}
        >
          Close
        </Button>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 12, py: 1.5, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          onClick={handleAddExpense}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
};

export default NewExpenseCompact;