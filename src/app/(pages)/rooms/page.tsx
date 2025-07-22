// src/app/rooms/page.tsx
'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Container, Card, CardContent, Fab, Box } from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBudget } from '../../../context/BudgetProvider';

const RoomListPage: React.FC = () => {
  const router = useRouter();
  const { state, addGroup } = useBudget();

  const handleClose = () => {
    router.back(); // Go back to the previous page
  };

  const handleAddRoom = () => {
    // TODO ⇢ Firebase: In a real app, this would open a dialog/modal for creating a new group in Firestore
    const newRoomName = `My New Group ${state.groups.length + 1}`;
    addGroup(newRoomName); // Add a dummy room for now
    // After adding, redirect to the newly created group or the first group if no new ID is generated immediately
    router.push(`/groups/${state.groups[state.groups.length -1]?.id || 'group1'}`);
  };

  return (
    <Box sx={{ pb: 8 }}> {/* Padding for bottom navigation */}
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="close" onClick={handleClose}>
            <Close />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', mr: 5 }}>
            Room List
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {state.groups.map((group) => (
          <Card
            key={group.id}
            sx={{ mb: 2, cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
            onClick={() => router.push(`/groups/${group.id}`)}
          >
            <CardContent>
              <Typography variant="h5" component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {group.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {group.members.map(m => m.displayName).join(', ')} ({group.members.length} members)
              </Typography>
            </CardContent>
          </Card>
        ))}

        {/* Dummy "New Room" section as per screenshot */}
        <Card sx={{ mb: 2, bgcolor: 'grey.100', boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" mb={2}>
              New Room
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[ 'What are Rooms?', 'Adding/Deleting Rooms', 'Managing Members', 'Cannot Access my Room'].map((text, index) => (
                <Card key={index} sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography component="span" role="img" aria-label="lightbulb" sx={{ mr: 1.5, fontSize: '1.2rem' }}>💡</Typography>
                      {text}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* FAB for adding room */}
      <Fab
        color="primary"
        aria-label="add room"
        sx={{
          position: 'fixed',
          bottom: 72, // Above bottom nav
          right: 24,
        }}
        onClick={handleAddRoom}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default RoomListPage;