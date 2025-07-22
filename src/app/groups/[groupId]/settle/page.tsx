// src/app/groups/[groupId]/settle/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useBudget } from '@/context/BudgetProvider';
import { useAuth } from '@/context/AuthContext';
import { settleDebts } from '@/lib/settle';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Avatar, Chip, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import moment from 'moment';

import { collection, addDoc, query, where, getDocs, onSnapshot, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SettleUpPage = () => {
  const params = useParams();
  const groupId = (params?.groupId as string) || '';
  const { getGroupById, getMembersByGroupId, getExpensesByGroupId, confirmSettlement } = useBudget();
  const { user } = useAuth();

  const group = getGroupById(groupId);
  const members = getMembersByGroupId(groupId);
  const expenses = getExpensesByGroupId(groupId);

  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));
  const [settlements, setSettlements] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const handleMonthChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedMonth(event.target.value as string);
    setTransactions([]); // Clear transactions when month changes
  };

  const handleCalculateSettlement = async () => {
    const startOfMonth = moment(selectedMonth).startOf('month').toDate();
    const endOfMonth = moment(selectedMonth).endOf('month').toDate();

    // Fetch fresh expenses for the selected month directly from Firestore
    const expensesRef = collection(db, `groups/${groupId}/expenses`);
    const q = query(
      expensesRef,
      where('date', '>=', startOfMonth),
      where('date', '<=', endOfMonth)
    );
    const querySnapshot = await getDocs(q);
    const freshExpenses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));

    const calculatedTransactions = settleDebts(freshExpenses, members);
    setTransactions(calculatedTransactions);
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.displayName || 'Unknown';
  };

  const handleProposeSettlement = async () => {
    if (transactions.length === 0) {
      alert("Please calculate the settlement first.");
      return;
    }
    const settlementDate = Timestamp.fromDate(moment(selectedMonth).startOf('month').toDate());
    const settlementsCollection = collection(db, 'settlements');
    
    console.log('Proposing settlement with transactions:', transactions);

    await addDoc(settlementsCollection, {
      transactions,
      groupId,
      month: settlementDate,
      status: 'pending',
    });
  };

  const handleResetSettlement = async () => {
    const batch = writeBatch(db);
    settlements.forEach(settlement => {
      const settlementDoc = doc(db, 'settlements', settlement.id);
      batch.delete(settlementDoc);
    });
    await batch.commit();
  };

  React.useEffect(() => {
    console.log('SettlePage useEffect triggered.');
    console.log('Auth user:', user);
    console.log('Group ID:', groupId);
    console.log('Selected month:', selectedMonth);

    if (!user || !groupId) {
      console.log('Skipping snapshot listener: user or groupId is missing.');
      return;
    }

    const startOfMonth = moment(selectedMonth).startOf('month').toDate();
    const endOfMonth = moment(selectedMonth).endOf('month').toDate();

    console.log('Querying settlements between:', startOfMonth, 'and', endOfMonth);

    const settlementsRef = collection(db, 'settlements');
    const q = query(
      settlementsRef,
      where('groupId', '==', groupId),
      where('month', '>=', startOfMonth),
      where('month', '<=', endOfMonth)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('Successfully received snapshot.');
      const fetchedSettlements: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedSettlements.push({ id: doc.id, ...doc.data() });
      });
      setSettlements(fetchedSettlements);
    }, (error) => {
      console.error("Error in snapshot listener:", error);
    });

    return () => {
      console.log('Cleaning up snapshot listener.');
      unsubscribe();
    };
  }, [groupId, selectedMonth, user]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settle Up
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="month-select-label">Month</InputLabel>
        <Select
          labelId="month-select-label"
          id="month-select"
          value={selectedMonth}
          label="Month"
          onChange={handleMonthChange as any}
        >
          {[...new Set(expenses.map(e => moment((e.date as Timestamp)?.toDate()).format('YYYY-MM')))].map(month => (
            <MenuItem key={month} value={month}>
              {moment(month).format('MMMM YYYY')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="contained" onClick={handleCalculateSettlement} fullWidth>
          Calculate Settlement
        </Button>
        <Button 
          variant="contained" 
          onClick={handleProposeSettlement} 
          fullWidth
          disabled={transactions.length === 0 || settlements.length > 0}
          color="secondary"
        >
          Propose Settlement
        </Button>
      </Box>

      {settlements.length > 0 && (
        <Button variant="outlined" onClick={handleResetSettlement} sx={{ mb: 4, ml: 2 }}>
          Reset Settlement
        </Button>
      )}

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Settlement for {moment(selectedMonth).format('MMMM YYYY')}
        </Typography>
        {settlements.length > 0 ? (
          <List>
            {settlements[0].transactions.map((transaction: any, index: number) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${getMemberName(transaction.from)} owes ${getMemberName(transaction.to)}`}
                  secondary={`${transaction.amount.toFixed(2)}`}
                />
                {settlements[0].status === 'pending' && (
                  <Button
                    variant="contained"
                    onClick={() => confirmSettlement(settlements[0].id)}
                    disabled={(
                      user?.uid !== transaction.to &&
                      user?.uid !== transaction.from &&
                      !members.find(m => m.id === transaction.from)?.isOffline &&
                      !members.find(m => m.id === transaction.to)?.isOffline
                    )}
                  >
                    Confirm
                  </Button>
                )}
                {settlements[0].status === 'confirmed' && (
                  <Chip label="Confirmed" color="success" />
                )}
              </ListItem>
            ))}
          </List>
        ) : transactions.length > 0 ? (
          <List>
            {transactions.map((transaction: any, index: number) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${getMemberName(transaction.from)} owes ${getMemberName(transaction.to)}`}
                  secondary={`${transaction.amount.toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Click "Calculate Settlement" to see who owes whom for this month.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default SettleUpPage;
