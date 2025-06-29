// src/app/invitations/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBudget } from '../../context/BudgetProvider';
import { Container, Typography, Box, List, ListItem, ListItemText, Button, CircularProgress, Alert } from '@mui/material';
import { collection, query, where, getDocs, doc, writeBatch, deleteDoc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Invitation {
  id: string;
  groupId: string;
  email: string;
  groupName?: string; // Optional: To display the group name in the invitation
  invitedBy?: string;
}

const InvitationsPage = () => {
  const { user } = useAuth();
  const { state, dispatch } = useBudget();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!user?.email) return;

      setLoading(true);
      try {
        const invitationsRef = collection(db, 'invitations');
        const q = query(invitationsRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setInvitations([]);
          setLoading(false);
          return;
        }
        
        const fetchedInvitations: any[] = (await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            try {
              const data = docSnapshot.data();
              const groupDoc = await getDoc(doc(db, "groups", data.groupId));
              const groupName = groupDoc.data()?.name || 'A group';
              const invitedByUserDoc = await getDoc(doc(db, "users", data.invitedBy));
              const invitedByUserData = invitedByUserDoc.data();
              const invitedByName = invitedByUserData?.displayName || 'Someone';
              const invitedByEmail = invitedByUserData?.email;
              const invitedBy = invitedByEmail ? `${invitedByName} (${invitedByEmail})` : invitedByName;
              return {
                id: docSnapshot.id,
                ...data,
                groupName,
                invitedBy,
              };
            } catch (error) {
              console.error("Failed to process invitation:", docSnapshot.id, error);
              return null;
            }
          })
        )).filter(Boolean); // Filter out nulls from failed fetches

        setInvitations(fetchedInvitations);
      } catch (err) {
        setError('Failed to fetch invitations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInvitations();
    }
  }, [user, state.groups]);

  const handleAccept = async (invitation: any) => {
    if (!user) return;

    try {
      const batch = writeBatch(db);

      // 1. Add user to the group's members subcollection
      const memberRef = collection(db, `groups/${invitation.groupId}/members`);
      await addDoc(memberRef, {
        displayName: user.displayName || 'New User',
        email: user.email,
        status: 'accepted',
        joinedAt: new Date(),
        userId: user.uid,
      });

      // 2. Delete the invitation
      const invitationRef = doc(db, 'invitations', invitation.id);
      batch.delete(invitationRef);

      await batch.commit();

      // Refresh invitations list
      setInvitations(prev => prev.filter(i => i.id !== invitation.id));

    } catch (err) {
      setError('Failed to accept invitation.');
      console.error(err);
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      const invitationRef = doc(db, 'invitations', invitationId);
      await deleteDoc(invitationRef);
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
    } catch (err) {
      setError('Failed to decline invitation.');
      console.error(err);
    }
  };

  if (loading) {
    return <Container sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  }

  if (error) {
    return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Invitations
      </Typography>
      {invitations.length > 0 ? (
        <List>
          {invitations.map((invitation) => (
            <ListItem key={invitation.id} secondaryAction={
              <Box>
                <Button variant="contained" onClick={() => handleAccept(invitation)} sx={{ mr: 1 }}>
                  Accept
                </Button>
                <Button variant="outlined" onClick={() => handleDecline(invitation.id)}>
                  Decline
                </Button>
              </Box>
            }>
              <ListItemText primary={`${invitation.invitedBy} has invited you to join ${invitation.groupName}`} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>You have no pending invitations.</Typography>
      )}
    </Container>
  );
};

export default InvitationsPage;
