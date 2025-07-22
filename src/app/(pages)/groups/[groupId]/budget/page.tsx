// /Users/kevinlam/Projects/turbo-budget/src/app/groups/[groupId]/budget/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBudget } from '@/context/BudgetProvider';
import { fetchBudgetBenchmark, BenchmarkData, getAvailableMonths } from '@/lib/budget';
import BudgetSummaryCard from '@/components/BudgetSummaryCard';
import CategoryList from '@/components/CategoryList';
import BudgetChart from '@/components/BudgetChart';
import {
  Typography,
  Container,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
} from '@mui/material';
import dayjs from 'dayjs';
import { MONTH_ID_FORMAT } from '@/constants';

const BudgetPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const initialGroupId = (params?.groupId as string) || '';

  const { state } = useBudget();
  const { groups, loading: loadingGroups } = state;

  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const fetchData = useCallback(async (groupId: string, monthOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      // First, get the list of all months that have data.
      const available = await getAvailableMonths(groupId);
      setAvailableMonths(available);

      // Determine which month to actually fetch budget data for.
      // 1. Use the month explicitly passed in (e.g., from the dropdown).
      // 2. If no month is passed, use the most recent month available from the database.
      // 3. If no data exists at all, fall back to the current system month.
      const monthToFetch = monthOverride || (available.length > 0 ? available[0] : dayjs().format(MONTH_ID_FORMAT));
      setSelectedMonth(monthToFetch);

      // Fetch the benchmark data for the determined month.
      const monthId = dayjs(monthToFetch).format(MONTH_ID_FORMAT);
      fetchBudgetBenchmark(groupId, monthId)
        .then((data) => {
          setBenchmarkData(data);
        })

    } catch (err) {
      console.error('Failed to fetch budget data:', err);
      setError('Failed to load budget data.');
      setBenchmarkData(null);
    } finally {
      setLoading(false);
    }
  }, []); // This function is stable and doesn't need dependencies.

  // Effect for handling initial load and group changes.
  useEffect(() => {
    if (initialGroupId) {
      setSelectedGroupId(initialGroupId);
      // On initial load, call fetchData without a specific month.
      // It will automatically use the latest available month.
      fetchData(initialGroupId);
    }
  }, [initialGroupId, fetchData]);

  const handleGroupChange = (event: any) => {
    const newGroupId = event.target.value as string;
    router.push(`/groups/${newGroupId}/budget`);
  };

  const handleMonthChange = (event: any) => {
    const newMonth = event.target.value as string;
    // When the user manually changes the month, fetch data for that specific month.
    fetchData(selectedGroupId, newMonth);
  };

  const currentGroup = groups.find((group) => group.id === selectedGroupId);

  if (loadingGroups || loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>
          {loadingGroups ? 'Loading groups...' : 'Loading budget data...'}
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error
        </Typography>
        <Typography>{error}</Typography>
      </Container>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          No groups available. Please create a group first.
        </Typography>
      </Container>
    );
  }

  if (!currentGroup) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Selected group not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Budget Analysis
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="group-select-label">Select Group</InputLabel>
            <Select
              labelId="group-select-label"
              id="group-select"
              value={selectedGroupId}
              label="Select Group"
              onChange={handleGroupChange}
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="month-select-label">Select Month</InputLabel>
            <Select
              labelId="month-select-label"
              id="month-select"
              value={selectedMonth}
              label="Select Month"
              onChange={handleMonthChange}
            >
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {dayjs(month, MONTH_ID_FORMAT).format('MMM YYYY')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {benchmarkData && benchmarkData.thisMonth ? (
        <>
          <BudgetSummaryCard
            thisMonth={benchmarkData.thisMonth}
            sixMonthAvg={benchmarkData.sixMonthAvg}
          />
          <Box sx={{ my: 4 }}>
            <BudgetChart
              thisMonthHistory={benchmarkData.monthlyHistory}
              sixMonthAvg={benchmarkData.sixMonthAvg}
            />
          </Box>
          <CategoryList
            thisMonth={benchmarkData.thisMonth}
            categoryAvgs={benchmarkData.categoryAvgs}
          />
          <Typography
            variant="caption"
            display="block"
            textAlign="center"
            sx={{ mt: 4, color: 'text.secondary' }}
          >
            Targets are based on a 6-month rolling average of spending.
          </Typography>
        </>
      ) : (
        <Typography variant="body1" color="text.secondary" align="center">
          No budget data available for this group for the selected month.
        </Typography>
      )}
    </Container>
  );
};

export default BudgetPage;