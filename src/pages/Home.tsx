import React from 'react';
import { Box, Typography, Container, Card, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, List, ListItem, ListItemText, Grid, Fab, useTheme } from '@mui/material';
import { Settings, Notifications, AddCircle, RemoveCircle, Home as HomeIcon } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AvatarStack from '../components/shared/AvatarStack';
import GradientButton from '../components/shared/GradientButton';
import { useBudget } from '../BudgetContext';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { expenseTrendData } from '../data/mockData'; // Import dummy chart data

const Home: React.FC = () => {
  const { state, dispatch, currentGroup } = useBudget();
  const { id } = useParams<{ id: string }>(); // Get group ID from URL
  const navigate = useNavigate();
  const theme = useTheme(); // Use theme for colors

  React.useEffect(() => {
    if (id && state.currentGroupId !== id) {
      dispatch({ type: 'SET_CURRENT_GROUP', payload: id });
    }
    // TODO: In a real app, you'd fetch group data based on 'id' here
    // If id is null/undefined, redirect to group selection
    if (!id) {
        navigate('/rooms');
    }
  }, [id, state.currentGroupId, dispatch, navigate]);

  const [selectedMonth, setSelectedMonth] = React.useState(moment().format('YYYY-MM'));
  const [showPrevBalance, setShowPrevBalance] = React.useState(false);

  if (!currentGroup) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Loading group data or group not found...
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" mt={2}>
            Please select a group from the <a href="/rooms">Room List</a>.
        </Typography>
      </Container>
    );
  }

  // Calculate summary based on current month's expenses
  const filteredExpenses = currentGroup.expenses.filter(expense =>
    moment(expense.date).format('YYYY-MM') === selectedMonth
  );

  const totalIncome = 0; // Placeholder for income
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Generate month options for the select dropdown
  const generateMonthOptions = () => {
    const months = [];
    let current = moment().startOf('month');
    const end = moment().add(6, 'months').startOf('month'); // Show next 6 months
    const start = moment().subtract(12, 'months').startOf('month'); // Show past 12 months

    while (current.isSameOrAfter(start) && current.isSameOrBefore(end)) {
        months.push(current.clone());
        current.subtract(1, 'month');
    }
    return months.sort((a,b) => a.valueOf() - b.valueOf()); // Sort ascending for dropdown
  };

  const monthOptions = generateMonthOptions();

  return (
    <Box sx={{ pb: 8 }}> {/* Padding bottom for fixed bottom nav */}
      {/* Cover Photo Section */}
      <Box
        sx={{
          position: 'relative',
          height: 250,
          backgroundImage: `url(${currentGroup.coverPhotoUrl || 'https://images.unsplash.com/photo-1517487823377-f273577d6118?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          p: 2,
          color: 'white',
          textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        {/* Top left icons */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 1 }}>
          <Fab size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}>
            <Settings fontSize="small" />
          </Fab>
          <Fab size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}>
            <HomeIcon fontSize="small" />
          </Fab>
        </Box>

        {/* Group Name */}
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
            mr: 'auto', // Push to left
            // For the screenshot example "11 黃色小鳥"
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 'calc(100% - 100px)', // Adjust based on avatar stack width
          }}
        >
          {currentGroup.name}
        </Typography>

        {/* Avatar Stack */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <AvatarStack members={currentGroup.members} max={4} />
        </Box>

        {/* Notification Bell FAB */}
        <Fab
          color="primary"
          aria-label="notifications"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            bgcolor: 'rgba(255,255,255,0.3)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.5)',
            },
          }}
          size="small"
        >
          <Notifications />
        </Fab>
      </Box>

      {/* Stats Card */}
      <Container sx={{ mt: -4, zIndex: 1, position: 'relative' }}>
        <Card sx={{ p: 2, pt: 1, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControl variant="standard" sx={{ minWidth: 120 }}>
              <InputLabel id="month-select-label">Month</InputLabel>
              <Select
                labelId="month-select-label"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value as string)}
                label="Month"
              >
                {monthOptions.map((month) => (
                  <MenuItem key={month.format('YYYY-MM')} value={month.format('YYYY-MM')}>
                    {month.format('MMM YYYY')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={showPrevBalance}
                  onChange={(e) => setShowPrevBalance(e.target.checked)}
                  color="primary"
                />
              }
              labelPlacement="start"
              label="Prev. Balance"
              sx={{ m: 0 }}
            />
          </Box>

          <List dense disablePadding>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemText primary="Income" />
              <Typography variant="body1" fontWeight="bold" color="text.secondary">
                ${totalIncome.toFixed(2)}
              </Typography>
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemText primary="Expenses" />
              <Typography variant="body1" fontWeight="bold">
                ${totalExpenses.toFixed(2)}
              </Typography>
            </ListItem>
            <ListItem sx={{ py: 1, px: 0, borderTop: '1px solid #eee', mt: 1 }}>
              <ListItemText primary="Balance" primaryTypographyProps={{ fontWeight: 'bold' }} />
              <Typography
                variant="h6"
                fontWeight="bold"
                color={balance < 0 ? 'error.main' : 'primary.main'}
              >
                ${balance.toFixed(2)}
              </Typography>
            </ListItem>
          </List>

          {/* Line Chart */}
          <Box sx={{ mt: 3, height: 200, width: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Expense Trend
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={expenseTrendData} // Using mock data for now
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: '0.75rem' }} />
                <YAxis hide domain={['dataMin', 'dataMax']} /> {/* Hide Y-axis as per screenshot */}
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke={theme.palette.primary.main} // Orange line
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                {/* Grey line as per screenshot, representing potentially previous trend or budget */}
                <Line
                  type="monotone"
                  dataKey="expenses" // Reusing data key, but could be a separate dataset
                  stroke="#bdbdbd" // Grey color
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                  // filter="url(#gradient)" // Apply gradient filter if needed
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Container>

      {/* Action Buttons */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, mt: 3 }}>
        <GradientButton
          startColor={theme.palette.secondary.main} // Light blue
          endColor="#00E5FF" // Teal
          variant="contained"
          fullWidth
          startIcon={<AddCircle />}
          onClick={() => console.log('Add Income')}
        >
          + Income
        </GradientButton>
        <GradientButton
          startColor={theme.palette.primary.main} // Amber
          endColor="#FFEB3B" // Yellow
          variant="contained"
          fullWidth
          startIcon={<RemoveCircle />}
          onClick={() => navigate(`/groups/${currentGroup.id}/expense/new`)} // Navigate to New Expense
        >
          - Expenses
        </GradientButton>
      </Box>
    </Box>
  );
};

export default Home; 