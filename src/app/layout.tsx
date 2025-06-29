// src/app/layout.tsx
import '../styles/globals.css';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../styles/theme';
import { BudgetProvider } from '../context/BudgetProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import ClientAppLayout from './client-app-layout';

import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Budget App',
  description: 'Family/Personal Budgeting and Bill Splitting App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('RootLayout: Rendering full layout with providers');
  return (
    <html lang="en" suppressHydrationWarning={true}> {/* Added suppressHydrationWarning */}
      <body suppressHydrationWarning={true}> {/* Added suppressHydrationWarning */}
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <BudgetProvider>
                <ClientAppLayout>
                  {children}
                </ClientAppLayout>
              </BudgetProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}