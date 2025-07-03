// src/app/groups/[groupId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import { Container, Typography, Box, Grid, Paper, List, ListItem, ListItemText, Avatar, Chip, Button, IconButton } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete';
import { useBudget } from '@/context/BudgetProvider'; // Adjust path as needed
import moment from 'moment';
import AddMemberDialog from '@/components/shared/AddMemberDialog';
import { Group, Member, Expense } from '@/context/BudgetProvider';

const GroupDetailPage = () => {
  const params = useParams();
  const router = useRouter(); // Initialize useRouter
  const groupId = (params?.groupId as string) || '';
  const { getGroupById, getMembersByGroupId, getExpensesByGroupId, addMember, addOfflineMember, removeMember } = useBudget();
  const [openAddMemberDialog, setOpenAddMemberDialog] = React.useState(false);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchGroupData = React.useCallback(() => {
    const groupData = getGroupById(groupId);
    setGroup(groupData || null);

    if (groupData) {
      const membersData = getMembersByGroupId(groupId);
      const expensesData = getExpensesByGroupId(groupId);
      setMembers(membersData);
      setExpenses(expensesData);
    }
  }, [groupId, getGroupById, getMembersByGroupId, getExpensesByGroupId]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  if (!group) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Group Not Found
        </Typography>
        <Typography variant="body1">
          The group with ID &quot;{groupId}&quot; does not exist or you do not have access.
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  const handleExpenseClick = (expenseId: string) => {
    router.push(`/groups/${groupId}/expense/${expenseId}/edit`);
  };

  const handleAddMember = async (emailOrName: string, type: 'online' | 'offline') => {
    if (type === 'online') {
      await addMember(groupId, emailOrName);
    } else {
      await addOfflineMember(groupId, emailOrName);
    }
    fetchGroupData();
    setOpenAddMemberDialog(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await removeMember(groupId, memberId);
      fetchGroupData();
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <GroupIcon sx={{ mr: 2, fontSize: '2.5rem' }} />
        <Typography variant="h4" component="h1" gutterBottom>
          {group.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Group Details */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Group Information
            </Typography>
            <Typography variant="body1">
              <strong>Group ID:</strong> {group.id}
            </Typography>
            {group.coverPhotoUrl && (
              <Box sx={{ mt: 2 }}>
                <Image src={group.coverPhotoUrl} alt="Group Cover" width={500} height={300} style={{ maxWidth: '100%', borderRadius: '8px' }} />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Members List */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Members ({members.length})</Typography>
              <Button variant="contained" sx={{ ml: 'auto' }} onClick={() => setOpenAddMemberDialog(true)}>
                Add Member
              </Button>
              <Button variant="outlined" sx={{ ml: 2 }} onClick={() => router.push(`/groups/${groupId}/settle`)}>
                Settle Up
              </Button>
            </Box>
            {members.length > 0 ? (
              <List>
                {members.map((member) => (
                  <ListItem key={member.id}>
                    <Avatar src={member.avatarUrl}>{member.displayName.charAt(0)}</Avatar>
                    <ListItemText
                      primary={member.displayName}
                      secondary={
                        <Box component="span">
                          Joined: {moment((member.joinedAt as Timestamp)?.toDate()).format('MMM D, YYYY')}
                          <Chip
                            label={member.status}
                            size="small"
                            color={member.status === 'accepted' ? 'success' : 'warning'}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      sx={{ ml: 2 }}
                    />
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveMember(member.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No members found for this group.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Expenses List */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AttachMoneyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Recent Expenses ({expenses.length})</Typography>
            </Box>
            {expenses.length > 0 ? (
              <List>
                {expenses.map((expense) => (
                  <ListItem
                    key={expense.id}
                    onClick={() => handleExpenseClick(expense.id)} // Added onClick handler
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }} // Add hover effect
                  >
                    <ListItemText
                      primary={expense.title}
                      secondary={`Paid by: ${members.find(m => m.id === expense.paidBy)?.displayName || 'Unknown'}`}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" component="span" sx={{ fontWeight: 'bold' }}>
                        {expense.amount.toFixed(2)} {expense.currency}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {moment((expense.date as Timestamp)?.toDate()).format('MMM D, YYYY')}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No expenses recorded for this group.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      <AddMemberDialog
        open={openAddMemberDialog}
        onClose={() => setOpenAddMemberDialog(false)}
        onAddMember={handleAddMember}
      />
    </Container>
  );
};

export default GroupDetailPage;
