// src/app/groups/[groupId]/list/page.tsx
'use client'; // This component uses client-side hooks like useRouter and useBudget

import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, IconButton, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { ArrowBack, AttachMoney } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation'; // Import useParams
import { useBudget } from '../../../../context/BudgetProvider'; // Adjust import path
import moment from 'moment';

const ListPage: React.FC = () => {
  const router = useRouter();
  const params = useParams(); // Get params from Next.js navigation
  const groupId = params?.groupId as string; // Extract groupId

  const { getExpensesByGroupId, getGroupById, getMembersByGroupId } = useBudget();

  const currentGroup = getGroupById(groupId || '');
  const allExpenses = React.useMemo(() => currentGroup ? getExpensesByGroupId(currentGroup.id) : [], [currentGroup, getExpensesByGroupId]);
  const groupMembers = currentGroup ? getMembersByGroupId(currentGroup.id) : [];

  // Memoize grouped expenses to prevent re-calculation on every render
  // This improves performance, especially with a growing list of expenses.
  const groupedExpenses = React.useMemo(() => {
    // Sort by date descending
    return allExpenses
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return (b.date as Timestamp).toMillis() - (a.date as Timestamp).toMillis()
      })
    .reduce((acc, expense) => {
      const dateKey = moment((expense.date as Timestamp).toDate()).format('YYYY-MM-DD');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(expense);
      return acc;
    }, {} as { [key: string]: typeof allExpenses }); // Type assertion for the accumulator
  }, [allExpenses]); // Recalculate only when allExpenses array changes

  const getMemberDisplayName = (memberId: string) => {
    return groupMembers.find(member => member.id === memberId)?.displayName || 'Unknown';
  };

  const handleExpenseClick = (expenseId: string) => {
    if (groupId) { // Use the extracted groupId
      router.push(`/groups/${groupId}/expense/${expenseId}/edit`);
    } else { // Fallback if groupId is unexpectedly undefined
      // Handle case where groupId is not available (e.g., show an alert or redirect)
      console.warn('Cannot navigate to edit expense: groupId is undefined.');
    }
  };

  return (
    <Box sx={{ pb: 8 }}>
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', mr: 5 }}>
            Expense List
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 2 }}>
        {/* Display message if no expenses are recorded */}
        {!allExpenses.length && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
            No expenses recorded for this group yet.
          </Typography>
        )}

        {Object.keys(groupedExpenses).map((dateKey) => (
          // Box for each date group
          <Box key={dateKey} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {moment(dateKey).calendar(null, {
                  sameDay: '[Today]',
                  lastDay: '[Yesterday]',
                  nextDay: '[Tomorrow]',
                  lastWeek: '[Last] dddd',
                  nextWeek: 'dddd',
                  sameElse: 'MMM DD, YYYY'
              })}
            </Typography>
            {/* List of expenses for the current date */}
            <List dense disablePadding sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
              {groupedExpenses[dateKey].map((expense, index) => (
                <React.Fragment key={expense.id}>
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => handleExpenseClick(expense.id)}
                    sx={{ py: 1.5, px: 2, cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }} // Added cursor and hover effect
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography component="span" variant="body1" fontWeight="medium">
                            {expense.title}
                          </Typography>
                          <Typography component="span" variant="body1" fontWeight="bold">
                            {expense.currency}{expense.amount.toFixed(2)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              component="span"
                              variant="body2" // Display who paid the expense
                              color="text.secondary"
                              sx={{ flexShrink: 0 }} 
                            >
                              Paid by: {expense.paidBy ? getMemberDisplayName(expense.paidBy) : 'Unknown'}
                            </Typography>
                            {expense.category && (
                              <Chip
                                label={expense.category} // Display expense category as a chip
                                size="small"
                                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                          {expense.note && (
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                  Note: {expense.note} {/* Display expense note */}
                              </Typography>
                          )}
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'span' }} // Ensures secondary content renders as a span, preventing common MUI warnings
                    />
                  </ListItem>
                  {index < groupedExpenses[dateKey].length - 1 && <Divider component="li" />} 
                </React.Fragment>
              ))}
            </List>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default ListPage;