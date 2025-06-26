import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Container, Box, TextField, ToggleButton, ToggleButtonGroup, Button, InputAdornment, Grid, Switch, FormControlLabel, Select, MenuItem, Autocomplete, Chip, List, FormControl, InputLabel } from '@mui/material';
import { ArrowBack, CameraAlt, FolderOpen, AddCircle, Edit as EditIcon } from '@mui/icons-material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useRouter } from 'next/navigation';
import MemberListItem from '../components/shared/MemberListItem';
import CurrencyField from '../components/shared/CurrencyField';
import { useBudget, Expense, ExpenseParticipant } from '../context/BudgetProvider';
import moment, { Moment } from 'moment';
import { categories } from '../data/mockData';

interface NewExpenseFullProps {
  groupId: string;
  expenseId?: string;
}

const NewExpenseFull: React.FC<NewExpenseFullProps> = ({ groupId, expenseId }) => {
  const router = useRouter();
  const { getGroupById, addExpense, updateExpense } = useBudget();

  const currentGroup = getGroupById(groupId);

  const [amount, setAmount] = React.useState<number | ''>('');
  const [receiptImage, setReceiptImage] = React.useState<File | null>(null);
  const [aiAutoFill, setAiAutoFill] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<typeof categories[0] | null>(
    categories.find(cat => cat.id === 'food') || null
  );
  const [expenseDate, setExpenseDate] = React.useState<Moment | null>(moment());
  const [note, setNote] = React.useState('');
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [recurringFrequency, setRecurringFrequency] = React.useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [recurringInterval, setRecurringInterval] = React.useState<number>(1);
  const [recurringDayOfWeek, setRecurringDayOfWeek] = React.useState<number | null>(null);
  const [recurringDayOfMonth, setRecurringDayOfMonth] = React.useState<number | null>(null);
  const [recurringEndDate, setRecurringEndDate] = React.useState<Moment | null>(null);
  const [divideExpense, setDivideExpense] = React.useState(true);
  const [splitMode, setSplitMode] = React.useState<string | null>('Even');
  const [participants, setParticipants] = React.useState<{ memberId: string; share: number; displayName: string; avatarUrl?: string }[]>([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = React.useState<string[]>([]);
  const [paidBy, setPaidBy] = React.useState<string | null>(null);

  const isEditMode = !!expenseId;
  const expenseToEdit = isEditMode ? currentGroup?.expenses.find(exp => exp.id === expenseId) : null;

  React.useEffect(() => {
    if (!currentGroup) {
      router.replace('/rooms');
      return;
    }

    const initialParticipants = currentGroup.members.map(member => ({
      memberId: member.id,
      displayName: member.displayName,
      avatarUrl: member.avatarUrl,
      share: 0,
    }));
    setParticipants(initialParticipants);
    setPaidBy(initialParticipants[0]?.memberId || null);
    setSelectedParticipantIds(currentGroup.members.map(member => member.id));

    if (isEditMode && expenseToEdit) {
      setAmount(expenseToEdit.amount);
      setSelectedCategory(categories.find(cat => cat.name === expenseToEdit.category) || null);
      setExpenseDate(moment(expenseToEdit.date));
      setNote(expenseToEdit.note || '');
      setIsRecurring(expenseToEdit.isRecurring || false);
      setPaidBy(expenseToEdit.paidBy);

      if (expenseToEdit.isRecurring) {
        const relatedRecurring = currentGroup.recurring.find(rec => rec.template.title === expenseToEdit.title && rec.template.amount === expenseToEdit.amount);
        if (relatedRecurring) {
          setRecurringFrequency(relatedRecurring.frequency);
          setRecurringInterval(relatedRecurring.interval);
          setRecurringDayOfWeek(relatedRecurring.dayOfWeek || null);
          setRecurringDayOfMonth(relatedRecurring.dayOfMonth || null);
          setRecurringEndDate(relatedRecurring.endDate ? moment(relatedRecurring.endDate) : null);
        }
      }

      if (expenseToEdit.participants && expenseToEdit.participants.length > 0) {
        setDivideExpense(true);
        const totalShare = expenseToEdit.participants.reduce((sum, p) => sum + p.share, 0);
        let determinedSplitMode = 'Even';
        if (totalShare > 0) {
          const isEvenSplit = expenseToEdit.participants.every(p => Math.abs(p.share - (expenseToEdit.amount / expenseToEdit.participants.length)) < 0.01);
          const sharesArePercentages = expenseToEdit.participants.every(p => p.share <= 100 && p.share >= 0) && Math.abs(totalShare - 100) < 0.01;
          if (isEvenSplit) {
            determinedSplitMode = 'Even';
            setSelectedParticipantIds(expenseToEdit.participants.map(p => p.memberId));
          } else if (sharesArePercentages) {
            determinedSplitMode = 'Ratio';
          } else {
            determinedSplitMode = 'Amount';
          }
        }
        setSplitMode(determinedSplitMode);
        const updatedParticipants = initialParticipants.map(initialP => {
          const existingP = expenseToEdit.participants.find(ep => ep.memberId === initialP.memberId);
          let shareValue = existingP ? existingP.share : 0;
          if (determinedSplitMode === 'Ratio' && typeof amount === 'number' && amount > 0) {
            shareValue = (shareValue / amount) * 100;
          }
          return { ...initialP, share: shareValue };
        });
        setParticipants(updatedParticipants);
      } else {
        setDivideExpense(false);
      }
    }
  }, [currentGroup, expenseId, isEditMode, expenseToEdit, router, amount]);

  React.useEffect(() => {
    if (splitMode === 'Even' && typeof amount === 'number' && amount > 0) {
      const numberOfActiveParticipants = selectedParticipantIds.length;
      if (numberOfActiveParticipants > 0) {
        const evenShare = amount / numberOfActiveParticipants;
        setParticipants(prev => prev.map(p => ({ ...p, share: selectedParticipantIds.includes(p.memberId) ? evenShare : 0 })));
      } else {
        setParticipants(prev => prev.map(p => ({ ...p, share: 0 })));
      }
    }
  }, [splitMode, amount, selectedParticipantIds]);

  const handleSplitModeChange = (event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode !== null) {
      setSplitMode(newMode);
      if (newMode === 'Even' && currentGroup) {
        setSelectedParticipantIds(currentGroup.members.map(member => member.id));
      } else if (newMode === 'Ratio' && participants.length > 0) {
        const initialRatioShare = 100 / participants.length;
        setParticipants(prev => prev.map(p => ({ ...p, share: initialRatioShare })));
      } else {
        setParticipants(prev => prev.map(p => ({ ...p, share: 0 })));
      }
    }
  };

  const handleToggleParticipant = (memberId: string) => {
    setSelectedParticipantIds(prevSelected => prevSelected.includes(memberId) ? prevSelected.filter(id => id !== memberId) : [...prevSelected, memberId]);
  };

  const handleParticipantShareChange = (memberId: string, value: number | string) => {
    setParticipants(prev => prev.map(p => (p.memberId === memberId ? { ...p, share: typeof value === 'number' ? value : parseFloat(value as string) || 0 } : p)));
  };

  const handleSubmitExpense = () => {
    if (!groupId || !currentGroup) {
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

    let actualParticipants: ExpenseParticipant[] = [];
    if (divideExpense) {
      if (splitMode === 'Even') {
        const numberOfActiveParticipants = selectedParticipantIds.length;
        if (numberOfActiveParticipants === 0) {
          alert('At least one participant must be selected for an even split.');
          return;
        }
        const evenShare = amount / numberOfActiveParticipants;
        actualParticipants = selectedParticipantIds.map(id => ({ memberId: id, share: evenShare }));
      } else if (splitMode === 'Ratio') {
        const totalPercentage = participants.reduce((sum, p) => sum + (selectedParticipantIds.includes(p.memberId) ? p.share : 0), 0);
        if (totalPercentage === 0) {
            alert('Total ratio cannot be zero in Ratio split mode.');
            return;
        }
        actualParticipants = participants.filter(p => selectedParticipantIds.includes(p.memberId) && p.share > 0).map(p => ({ memberId: p.memberId, share: (p.share / totalPercentage) * amount }));
      } else if (splitMode === 'Amount') {
        actualParticipants = participants.filter(p => selectedParticipantIds.includes(p.memberId) && p.share > 0).map(p => ({ memberId: p.memberId, share: p.share }));
      }
    }

    const receiptUrl = receiptImage ? 'mock-receipt-url.jpg' : undefined;
    const expenseData: Omit<Expense, 'id' | 'groupId'> = {
      title: selectedCategory?.name || 'New Expense',
      amount,
      currency: 'USD',
      paidBy,
      date: expenseDate ? expenseDate.toDate() : new Date(),
      receiptUrl,
      participants: actualParticipants,
      category: selectedCategory?.name,
      note,
      isRecurring,
      ...(isRecurring && {
        recurringFrequency,
        recurringInterval,
        recurringDayOfWeek: recurringDayOfWeek || undefined,
        recurringDayOfMonth: recurringDayOfMonth || undefined,
        recurringEndDate: recurringEndDate ? recurringEndDate.toDate() : undefined,
      })
    };

    if (isEditMode && expenseToEdit) {
      updateExpense({ ...expenseToEdit, ...expenseData, id: expenseToEdit.id, groupId });
    } else {
      addExpense(expenseData, groupId);
    }
    router.back();
  };

  if (!currentGroup) return <Container sx={{ py: 4 }}><Typography variant="h6" color="text.secondary" align="center">Group data not available.</Typography></Container>;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ pb: 8 }}>
        <AppBar position="static" color="inherit" elevation={1}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="back" onClick={() => router.back()}><ArrowBack /></IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', mr: 5 }}>{isEditMode ? 'Edit Expense' : 'New Expense'}</Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="sm" sx={{ py: 2 }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Amount</Typography>
          <CurrencyField value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="0.00" inputProps={{ style: { fontSize: '2rem', textAlign: 'right', fontWeight: 'bold' } }} sx={{ mb: 3 }} fullWidth variant="standard" />
          <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>Receipt Image</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} id="receipt-image-upload" onChange={(e) => setReceiptImage(e.target.files ? e.target.files[0] : null)} />
            <IconButton component="label" htmlFor="receipt-image-upload" color="primary" sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 2, mr: 1, p: 1.5 }}><CameraAlt fontSize="large" /></IconButton>
            <IconButton component="label" htmlFor="receipt-image-upload" color="primary" sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 2, mr: 2, p: 1.5 }}><FolderOpen fontSize="large" /></IconButton>
          </Box>
          <Autocomplete value={selectedCategory} onChange={(_event, newValue) => setSelectedCategory(newValue)} options={categories} getOptionLabel={(option) => option.name} isOptionEqualToValue={(option, value) => option.id === value.id} renderOption={(props, option) => (<Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}><span role="img" aria-label={option.name} style={{ marginRight: 8 }}>{option.emoji}</span>{option.name}</Box>)} renderInput={(params) => (<TextField {...params} label="Category" variant="standard" InputProps={{ ...params.InputProps, endAdornment: (<InputAdornment position="end">{params.InputProps.endAdornment}<IconButton size="small"><EditIcon fontSize="small" /></IconButton></InputAdornment>),}}/>)} sx={{ mb: 2 }} />
          <DatePicker label="Day" value={expenseDate} onChange={(newValue) => setExpenseDate(newValue)} slotProps={{ textField: { variant: 'standard', fullWidth: true } }} sx={{ mb: 2 }} />
          <TextField label="Note" placeholder="Place / Use" value={note} onChange={(e) => setNote(e.target.value)} variant="standard" fullWidth sx={{ mb: 3 }} />
          <FormControlLabel control={<Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} color="primary" />} label="Recurring" labelPlacement="start" sx={{ mr: 'auto', ml: 0, mb: 2, width: '100%', justifyContent: 'space-between' }} />
          {isRecurring && (
            <Box sx={{ mt: -1, mb: 3 }}>
              <FormControl fullWidth variant="standard" sx={{ mb: 2 }}><InputLabel>Frequency</InputLabel><Select value={recurringFrequency} onChange={(e) => setRecurringFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')} label="Frequency"><MenuItem value="daily">Daily</MenuItem><MenuItem value="weekly">Weekly</MenuItem><MenuItem value="monthly">Monthly</MenuItem><MenuItem value="yearly">Yearly</MenuItem></Select></FormControl>
              <TextField label="Repeat Every" type="number" value={recurringInterval} onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)} variant="standard" fullWidth sx={{ mb: 2 }} InputProps={{ inputProps: { min: 1 } }} />
              {recurringFrequency === 'weekly' && (<FormControl fullWidth variant="standard" sx={{ mb: 2 }}><InputLabel>Day of Week</InputLabel><Select value={recurringDayOfWeek || ''} onChange={(e) => setRecurringDayOfWeek(parseInt(e.target.value as string))} label="Day of Week">{daysOfWeek.map((day, index) => (<MenuItem key={day} value={index}>{day}</MenuItem>))}</Select></FormControl>)}
              {recurringFrequency === 'monthly' && (<TextField label="Day of Month" type="number" value={recurringDayOfMonth || ''} onChange={(e) => setRecurringDayOfMonth(parseInt(e.target.value) || 1)} variant="standard" fullWidth sx={{ mb: 2 }} InputProps={{ inputProps: { min: 1, max: 31 } }} />)}
              <DatePicker label="End Date (Optional)" value={recurringEndDate} onChange={(newValue) => setRecurringEndDate(newValue)} slotProps={{ textField: { variant: 'standard', fullWidth: true } }} sx={{ mb: 2 }} />
            </Box>
          )}
          <FormControlLabel control={<Switch checked={divideExpense} onChange={(e) => setDivideExpense(e.target.checked)} color="success" />} label="Divide the Expense" labelPlacement="start" sx={{ mr: 'auto', ml: 0, mb: 3, width: '100%', justifyContent: 'space-between' }} />
          {divideExpense && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>How should we divide this?</Typography>
              <ToggleButtonGroup value={splitMode} exclusive onChange={handleSplitModeChange} fullWidth color="primary" sx={{ mb: 2, borderRadius: '12px !important' }}><ToggleButton value="Even">Even</ToggleButton><ToggleButton value="Ratio">Ratio</ToggleButton><ToggleButton value="Amount">Amount</ToggleButton><ToggleButton value="Joint">Joint</ToggleButton></ToggleButtonGroup>
              <List dense disablePadding>
                {currentGroup.members.map((member) => {
                  const participantData = participants.find(p => p.memberId === member.id) || { share: 0 };
                  return (
                    <MemberListItem
                      key={member.id}
                      id={member.id}
                      displayName={member.displayName}
                      avatarUrl={member.avatarUrl}
                      value={splitMode === 'Even' ? participantData.share : participantData.share}
                      onChange={handleParticipantShareChange}
                      mode={splitMode === 'Even' ? 'even-toggle' : splitMode === 'Ratio' ? 'input' : 'input'}
                      currencySymbol={splitMode === 'Ratio' ? '%' : '$'}
                      isMemberSelected={selectedParticipantIds.includes(member.id)}
                      onToggleSelect={handleToggleParticipant}
                    />
                  );
                })}
              </List>
            </>
          )}
        </Container>
        <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'background.paper', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', display: 'flex', gap: 2, zIndex: 1000 }}>
          <Button variant="outlined" fullWidth sx={{ borderRadius: 12, py: 1.5, borderColor: 'grey.300', color: 'text.primary' }} onClick={() => router.back()}>Close</Button>
          <Button variant="contained" fullWidth sx={{ borderRadius: 12, py: 1.5, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }} onClick={handleSubmitExpense}> {isEditMode ? 'Update' : 'Add'} </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default NewExpenseFull;
