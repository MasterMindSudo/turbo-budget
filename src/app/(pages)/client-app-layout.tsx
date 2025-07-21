// src/app/client-app-layout.tsx

'use client'; // This is a client component

import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EditIcon from '@mui/icons-material/Edit';
import PieChartIcon from '@mui/icons-material/PieChart';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import { useBudget } from '../../context/BudgetProvider';

interface ClientAppLayoutProps {
  children: React.ReactNode;
}

const ClientAppLayout: React.FC<ClientAppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const router = useRouter();
  const pathname = usePathname();
  const { state } = useBudget();
  const { activeGroup } = state;

  const getActiveTab = (currentPath: string) => {
    if (currentPath.includes('/dashboard')) return 'home';
    if (currentPath.includes('/list')) return 'list';
    if (currentPath.includes('/budget')) return 'budget';
    if (currentPath.includes('/profile')) return 'profile';
    if (currentPath.includes('/invitations')) return 'invitations';
    if (currentPath.includes('/expense/new')) return 'edit';
    if (currentPath.includes('/groups/')) return 'home';
    return 'home';
  };

  const [value, setValue] = React.useState(getActiveTab(pathname || ''));

  React.useEffect(() => {
    setValue(getActiveTab(pathname || ''));
  }, [pathname]);

  const handleNavigation = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    if (!activeGroup && !['home', 'profile', 'invitations'].includes(newValue)) {
      router.push('/dashboard');
      return;
    }

    switch (newValue) {
      case 'home':
        router.push('/dashboard');
        break;
      case 'list':
        router.push(`/groups/${activeGroup}/list`);
        break;
      case 'edit':
        router.push(`/groups/${activeGroup}/expense/new`);
        break;
      case 'budget':
        router.push(`/groups/${activeGroup}/budget`);
        break;
      case 'profile':
        router.push('/profile');
        break;
      case 'invitations':
        router.push('/invitations');
        break;
      default:
        router.push('/dashboard');
        break;
    }
  };

  const isExpenseFormPage = pathname?.includes('/expense/new') || pathname?.includes('/expense/edit');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100svh',
      }}
    >
      <Card
        sx={{
          margin: '1rem',
          maxWidth: isDesktop ? theme.breakpoints.values.md : 'calc(100% - 2rem)',
          width: '100%',
          flexGrow: 1,
        }}
      >
        <CardContent>
          <AppBar position="static" color="inherit" elevation={1} sx={{ backgroundColor: 'white', display: 'none' }}>
            <Toolbar sx={{ justifyContent: 'center' }}>
            </Toolbar>
          </AppBar>

          <Box component="main" sx={{ flexGrow: 1, pb: isExpenseFormPage ? 0 : '56px' }}>
            {children}
          </Box>

          {!isExpenseFormPage && (
            <Paper
              elevation={3}
              sx={{
                position: 'fixed',
                bottom: '1rem',
                // left: '1rem',
                // right: '1rem',
                zIndex: 1000
              }}
            >
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
                  sx={
                    {
                      minWidth: 'auto',
                      '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.75rem',
                      },
                    }
                  }
                />
                <BottomNavigationAction label="Budget" value="budget" icon={<PieChartIcon />} />
                <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} />
                <BottomNavigationAction label="Invitations" value="invitations" icon={<MailIcon />} />
              </BottomNavigation>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientAppLayout;
