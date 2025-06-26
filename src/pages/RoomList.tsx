import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Container, Card, CardContent, Fab, Box } from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '../BudgetContext';

const RoomList: React.FC = () => {
  const navigate = useNavigate();
  const { state, addGroup } = useBudget();

  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleAddRoom = () => {
    // In a real app, this would open a dialog or navigate to a creation form
    const newRoomName = `New Room ${state.groups.length + 1}`;
    addGroup(newRoomName); // Add a dummy room for now
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
          {/* No plus button on AppBar as per screenshot */}
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {state.groups.map((group) => (
          <Card
            key={group.id}
            sx={{ mb: 2, cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
            onClick={() => navigate(`/groups/${group.id}`)}
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
        <Card sx={{ mb: 2, bgcolor: 'grey.100' }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" mb={2}>
              New Room
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[<Typography component="span" role="img" aria-label="lightbulb" sx={{ mr: 1.5, fontSize: '1.2rem' }}>💡</Typography>, 'What are Rooms?'], [<Typography component="span" role="img" aria-label="lightbulb" sx={{ mr: 1.5, fontSize: '1.2rem' }}>💡</Typography>, 'Adding/Deleting Rooms'], [<Typography component="span" role="img" aria-label="lightbulb" sx={{ mr: 1.5, fontSize: '1.2rem' }}>💡</Typography>, 'Managing Members'], [<Typography component="span" role="img" aria-label="lightbulb" sx={{ mr: 1.5, fontSize: '1.2rem' }}>💡</Typography>, 'Cannot Access my Room']].map((text, index) => (
                <Card key={index} sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
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

export default RoomList;
