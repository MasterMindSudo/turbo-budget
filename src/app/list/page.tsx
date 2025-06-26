git reset HEAD~1// src/app/list/page.tsx
'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, IconButton, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { ArrowBack, AttachMoney } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useBudget } from '../../context/BudgetProvider';
import moment from 'moment';

const ListPage: React.FC = () => {
  const router = useRouter();
  const { getExpensesByGroupId, getGroupById, getMembersByGroupId, state } = useBudget();

  // For simplicity, let's assume we're viewing expenses for the currently selected group (group1)
  // TODO ⇢ Firebase: In a real app, this page might allow selecting a group or display all expenses for all groups the user is a part of.
  const currentGroupId = state.groups[0]?.id; // Default to the first group in mock data
  const currentGroup = getGroupById(currentGroupId || '');
  const allExpenses = currentGroup ? getExpensesByGroupId(currentGroup.id) : [];
  const groupMembers = currentGroup ? getMembersByGroupId(currentGroup.id) : [];

  // Group expenses by date
  const groupedExpenses = allExpenses.sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by date descending
    .reduce((acc, expense) => {
      const dateKey = moment(expense.date).format('YYYY-MM-DD');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(expense);
      return acc;
    }, {} as { [key: string]: typeof allExpenses });

  const getMemberDisplayName = (memberId: string) => {
    return groupMembers.find(member => member.id === memberId)?.displayName || 'Unknown';
  };

  const handleExpenseClick = (expenseId: string) => {
    if (currentGroupId) {
      router.push(`/groups/${currentGroupId}/expense/${expenseId}/edit`);
    } else {
      // Handle case where currentGroupId is not available (e.g., show an alert or redirect)
      console.warn('Cannot navigate to edit expense: currentGroupId is undefined.');
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
        {!allExpenses.length && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
            No expenses recorded for this group yet.
          </Typography>
        )}

        {Object.keys(groupedExpenses).map((dateKey) => (
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
            <List dense disablePadding sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
              {groupedExpenses[dateKey].map((expense, index) => (
                <React.Fragment key={expense.id}>
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => handleExpenseClick(expense.id)} // Added onClick handler
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
                              variant="body2"
                              color="text.secondary"
                              sx={{ flexShrink: 0 }} 
                            >
                              Paid by: {getMemberDisplayName(expense.paidBy)}
                            </Typography>
                            {expense.category && (
                              <Chip
                                label={expense.category}
                                size="small"
                                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                          {expense.note && (
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                  Note: {expense.note}
                              </Typography>
                          )}
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'span' }} // FIX: Make ListItemText's internal secondary Typography render a span
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
