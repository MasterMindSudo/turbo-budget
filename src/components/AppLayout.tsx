import React from 'react';
import { AppBar, Toolbar, Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EditIcon from '@mui/icons-material/Edit';
import PieChartIcon from '@mui/icons-material/PieChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface AppLayoutProps {
  // Can add props for dynamic app bar content if needed
}

const AppLayout: React.FC<AppLayoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current active tab based on path
  const getActiveTab = (pathname: string) => {
    if (pathname.startsWith('/groups')) return 'home';
    if (pathname.startsWith('/list')) return 'list';
    if (pathname.startsWith('/budget')) return 'budget';
    if (pathname.startsWith('/todo')) return 'todo';
    if (pathname.startsWith('/new')) return 'edit'; // Or any other route that triggers the FAB
    return 'home'; // Default to home
  };

  const [value, setValue] = React.useState(getActiveTab(location.pathname));

  React.useEffect(() => {
    setValue(getActiveTab(location.pathname));
  }, [location.pathname]);


  const handleNavigation = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    switch (newValue) {
      case 'home':
        navigate('/groups'); // Navigate to the group list page
        break;
      case 'list':
        navigate('/list'); // Placeholder
        break;
      case 'edit':
        // This is typically a FAB, so it might open a modal or navigate to a dedicated new expense page.
        // For now, let's navigate to New Expense (full form) if it's the center button.
        navigate('/expense/new');
        break;
      case 'budget':
        navigate('/budget'); // Placeholder
        break;
      case 'todo':
        navigate('/todo'); // Placeholder
        break;
      default:
        navigate('/groups');
        break;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="inherit" elevation={1} sx={{ backgroundColor: 'white' }}>
        <Toolbar sx={{ justifyContent: 'center' }}>
          {/* Top app bar content will be rendered by specific pages via Outlet */}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, pb: '56px' }}> {/* Padding for bottom navigation */}
        <Outlet />
      </Box>

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={handleNavigation}
        >
          <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} />
          <BottomNavigationAction label="List" value="list" icon={<FormatListBulletedIcon />} />
          {/* Central FAB-like button for Edit/New Expense */}
          <BottomNavigationAction
            label="Edit"
            value="edit"
            icon={<EditIcon />}
            sx={{
              minWidth: 'auto',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem', // Adjust label font size for better fit
              },
              // Optional: if this was a true FAB, it would be a separate component positioned over the nav
            }}
          />
          <BottomNavigationAction label="Budget" value="budget" icon={<PieChartIcon />} />
          <BottomNavigationAction label="To-do" value="todo" icon={<CheckCircleIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default AppLayout;