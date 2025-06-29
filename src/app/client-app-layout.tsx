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
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
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
    if (currentPath.includes('/groups') && !currentPath.includes('/expense') && !currentPath.includes('/budget')) return 'home';
    if (currentPath.includes('/list')) return 'list';
    if (currentPath.includes('/budget')) return 'budget';
    if (currentPath.includes('/todo')) return 'todo';
    if (currentPath.includes('/profile')) return 'profile';
    if (currentPath.includes('/invitations')) return 'invitations';
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
        router.push('/groups');
        break;
      case 'list':
        router.push('/list'); // Placeholder route
        break;
      case 'edit':
        router.push('/expense/new');
        break;
      case 'budget':
        router.push('/groups/group1/budget'); // Updated route
        break;
      case 'todo':
        router.push('/todo'); // Placeholder route
        break;
      case 'profile':
        router.push('/profile');
        break;
      case 'invitations':
        router.push('/invitations');
        break;
      default:
        router.push('/groups');
        break;
    }
  };

  const isExpenseFormPage = pathname?.includes('/groups/') && (pathname?.includes('/expense/new') || pathname?.includes('/expense/edit'));

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

      <Box component="main" sx={{ flexGrow: 1, pb: isExpenseFormPage ? 0 : '56px' }}> {/* Padding for bottom navigation */}
        {children}
      </Box>

      {!isExpenseFormPage && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={value}
            onChange={handleNavigation}
          >
            <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} />
            <BottomNavigationAction label="List" value="list" icon={<FormatListBulletedIcon />} />
            <BottomNavigationAction
              label="Edit"
              value="edit"
              icon={<EditIcon />}
              sx={{
                minWidth: 'auto',
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                },
              }}
            />
            <BottomNavigationAction label="Budget" value="budget" icon={<PieChartIcon />} />
            <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} />
            <BottomNavigationAction label="Invitations" value="invitations" icon={<MailIcon />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default ClientAppLayout;