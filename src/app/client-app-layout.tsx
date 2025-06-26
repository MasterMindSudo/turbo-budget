// src/app/client-app-layout.tsx

'use client'; // This is a client component

import React from 'react';
import { AppBar, Toolbar, Box, BottomNavigation, BottomNavigationAction, Paper, Fab } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EditIcon from '@mui/icons-material/Edit';
import PieChartIcon from '@mui/icons-material/PieChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';

interface ClientAppLayoutProps {
  children: React.ReactNode;
}

const ClientAppLayout: React.FC<ClientAppLayoutProps> = ({ children }) => {
  console.log('ClientAppLayout component rendered');
  const router = useRouter();
  const pathname = usePathname();

  // Determine current active tab based on path
  const getActiveTab = (currentPath: string) => {
    if (currentPath.includes('/groups') && !currentPath.includes('/expense')) return 'home';
    if (currentPath.includes('/list')) return 'list';
    if (currentPath.includes('/budget')) return 'budget';
    if (currentPath.includes('/todo')) return 'todo';
    if (currentPath.includes('/expense/new')) return 'edit'; // Central FAB often maps to new expense
    return 'home'; // Default fallback
  };

  const [value, setValue] = React.useState(getActiveTab(pathname || ''));

  React.useEffect(() => {
    setValue(getActiveTab(pathname || ''));
  }, [pathname]);

  const handleNavigation = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    switch (newValue) {
      case 'home':
        router.push('/groups/group1'); // Navigate to a default group for now
        break;
      case 'list':
        router.push('/list'); // Placeholder route
        break;
      case 'edit':
        router.push('/groups/group1/expense/new'); // Navigate to New Expense (full form)
        break;
      case 'budget':
        router.push('/budget'); // Placeholder route
        break;
      case 'todo':
        router.push('/todo'); // Placeholder route
        break;
      default:
        router.push('/groups/group1');
        break;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* The main content (children) will render here, including their own AppBar if needed.
          The top AppBar here is primarily to provide the height and consistent background.
          Individual pages will place their specific AppBars inside their content.
      */}
      <AppBar position="static" color="inherit" elevation={1} sx={{ backgroundColor: 'white', display: 'none' }}>
        <Toolbar sx={{ justifyContent: 'center' }}>
          {/* Placeholder for top app bar content if needed globally */}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, pb: '56px' }}> {/* Padding for bottom navigation */}
        {children}
      </Box>

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={handleNavigation}
        >
          <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} component={Link} href="/groups/group1" />
          <BottomNavigationAction label="List" value="list" icon={<FormatListBulletedIcon />} component={Link} href="/list" />
          <BottomNavigationAction
            label="Edit"
            value="edit"
            icon={<EditIcon />}
            component={Link}
            href="/groups/group1/expense/new" // Link to the full new expense page
            sx={{
              minWidth: 'auto',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
              },
            }}
          />
          <BottomNavigationAction label="Budget" value="budget" icon={<PieChartIcon />} component={Link} href="/budget" />
          <BottomNavigationAction label="To-do" value="todo" icon={<CheckCircleIcon />} component={Link} href="/todo" />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default ClientAppLayout;