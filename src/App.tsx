import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import AppLayout from './components/AppLayout';
import { BudgetProvider } from './BudgetContext';

import { useParams } from 'react-router-dom';

// Page components
import Home from './pages/Home';
import RoomList from './pages/RoomList';
import NewExpenseCompact from './pages/NewExpenseCompact';
import NewExpenseFull from './pages/NewExpenseFull';
// TODO: Create List, Budget, ToDo pages

const NewExpenseFullWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <NewExpenseFull groupId={id!} />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Resets CSS to a consistent baseline and applies Material Design styles */}
      <Router>
        <BudgetProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/groups/group1" replace />} /> {/* Redirect to a default group */}
              <Route path="/groups/:id" element={<Home />} />
              <Route path="/rooms" element={<RoomList />} />
              <Route path="/groups/:id/expense/new/simple" element={<NewExpenseCompact />} />
              <Route path="/groups/:id/expense/new" element={<NewExpenseFullWrapper />} />
              {/* Placeholder routes for other bottom navigation items */}
              <Route path="/list" element={<div>List Page (TODO)</div>} />
              <Route path="/budget" element={<div>Budget Page (TODO)</div>} />
              <Route path="/todo" element={<div>To-Do Page (TODO)</div>} />
              {/* Catch-all for unknown routes */}
              <Route path="*" element={<Navigate to="/groups/group1" replace />} />
            </Route>
          </Routes>
        </BudgetProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;