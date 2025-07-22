// src/app/client-app-layout.tsx

'use client'; // This is a client component

import { FC, ReactNode, SyntheticEvent, useEffect, useState } from 'react';
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
  useMediaQuery,
  CardActionArea,
  CardActions,
  CardHeader,
  Tab,
  Tabs
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
  children: ReactNode;
}

const ClientAppLayout: FC<ClientAppLayoutProps> = ({ children }) => {
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

  const [value, setValue] = useState(getActiveTab(pathname || ''));
  const [tab, setTab] = useState(1);

  useEffect(() => {
    setValue(getActiveTab(pathname || ''));
  }, [pathname]);

  const handleNavigation = (event: SyntheticEvent, newValue: string) => {
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

  const marginSize = '1rem';

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
          width: '100%',
          margin: `${marginSize} ${marginSize} 0`,
          maxWidth: isDesktop ? theme.breakpoints.values.md : `calc(100% - ${marginSize} * 2)`,
          ':after': {
            content: '""',
            display: 'inline-block',
            paddingBottom: '2rem',
          }
        }}
      >
        <Tabs
          variant="fullWidth"
          centered
          value={tab}
          onChange={(event, newValue) => setTab(newValue)}
        >
            <Tab label="Personal" value={1}/>
            <Tab label="Group" value={2}/>
          </Tabs>
      </Card>
      <Card
        sx={{
          margin: `-2rem ${marginSize} ${marginSize}`,
          maxWidth: isDesktop ? theme.breakpoints.values.md : `calc(100% - ${marginSize} * 2)`,
          width: '100%',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            maxHeight: 'calc(100svh - 64px - 56px)', // Adjust for AppBar and BottomNavigation height
            overflowY: 'auto',
          }}>
          <AppBar position="static" color="inherit" elevation={1} sx={{ backgroundColor: 'white', display: 'none' }}>
            <Toolbar sx={{ justifyContent: 'center' }}>
            </Toolbar>
          </AppBar>

          <Box component="main" sx={{ flexGrow: 1, pb: isExpenseFormPage ? 0 : '56px' }}>
            {children}
          </Box>
        </CardContent>
        <CardActions sx={{ padding: marginSize }} >
          {!isExpenseFormPage && (
            <Box
              sx={{
                bottom: `calc(${marginSize} * 2)`,
                width: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',

              }}
            >
              <BottomNavigation
                showLabels
                value={value}
                onChange={handleNavigation}
              >
                <BottomNavigationAction label={isDesktop ? "Home" : ""} value="home" icon={<HomeIcon />} />
                <BottomNavigationAction label={isDesktop ? "List" : ""} value="list" icon={<FormatListBulletedIcon />} />
                <BottomNavigationAction
                  label={isDesktop ? "Edit" : ""}
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
                <BottomNavigationAction label={isDesktop ? "Budget" : ""} value="budget" icon={<PieChartIcon />} />
                <BottomNavigationAction label={isDesktop ? "Profile" : ""} value="profile" icon={<PersonIcon />} />
                <BottomNavigationAction label={isDesktop ? "Invitations" : ""} value="invitations" icon={<MailIcon />} />
              </BottomNavigation>
            </Box>
          )}
        </CardActions>
      </Card>
    </Box>
  );
};

export default ClientAppLayout;
