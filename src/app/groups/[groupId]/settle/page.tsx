// src/app/groups/[groupId]/settle/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useBudget } from '@/context/BudgetProvider';
import { useAuth } from '@/context/AuthContext';
import { settleDebts } from '@/lib/settle';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Avatar, Chip, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import moment from 'moment';

import { collection, addDoc, query, where, getDocs, onSnapshot, writeBatch, doc } from 'firebase/firestore';
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

  const handleMonthChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedMonth(event.target.value as string);
  };

  const filteredExpenses = expenses.filter(expense => moment(expense.date).format('YYYY-MM') === selectedMonth);
  const transactions = settleDebts(filteredExpenses, members);

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.displayName || 'Unknown';
  };

  const handleProposeSettlement = async () => {
    const settlementsCollection = collection(db, 'settlements');
    for (const transaction of transactions) {
      await addDoc(settlementsCollection, {
        ...transaction,
        groupId,
        month: selectedMonth,
        status: 'pending',
      });
    }
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
    const settlementsRef = collection(db, 'settlements');
    const q = query(settlementsRef, where('groupId', '==', groupId), where('month', '==', selectedMonth));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedSettlements: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedSettlements.push({ id: doc.id, ...doc.data() });
      });
      setSettlements(fetchedSettlements);
    });

    return () => unsubscribe();
  }, [groupId, selectedMonth]);

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
          {[...new Set(expenses.map(e => moment(e.date).format('YYYY-MM')))].map(month => (
            <MenuItem key={month} value={month}>
              {moment(month).format('MMMM YYYY')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleProposeSettlement} sx={{ mb: 4 }} disabled={settlements.length > 0}>
        Propose Settlement
      </Button>

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
            {settlements.map((settlement, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${getMemberName(settlement.from)} owes ${getMemberName(settlement.to)}`}
                  secondary={`${settlement.amount.toFixed(2)}`}
                />
                {settlement.status === 'pending' && (
                  <Button
                    variant="contained"
                    onClick={() => confirmSettlement(settlement.id)}
                    disabled={(
                      user?.uid !== settlement.to &&
                      user?.uid !== settlement.from &&
                      !members.find(m => m.id === settlement.from)?.isOffline &&
                      !members.find(m => m.id === settlement.to)?.isOffline
                    )}
                  >
                    Confirm
                  </Button>
                )}
                {settlement.status === 'confirmed' && (
                  <Chip label="Confirmed" color="success" />
                )}
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">No settlements needed for this month.</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default SettleUpPage;
