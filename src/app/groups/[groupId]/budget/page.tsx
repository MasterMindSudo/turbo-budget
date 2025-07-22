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
import { format } from 'date-fns';
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

  // Effect for fetching available months on initial load or when the group changes
  useEffect(() => {
    if (selectedGroupId) {
      setLoading(true);
      getAvailableMonths(selectedGroupId)
        .then(months => {
          setAvailableMonths(months);
          // Set the selected month to the most recent one available, or the current month if none exist.
          setSelectedMonth(months.length > 0 ? months[0] : dayjs().format(MONTH_ID_FORMAT));
        })
        .catch(err => {
          console.error('Failed to fetch available months:', err);
          setError('Failed to load available months.');
        });
    }
  }, [selectedGroupId]);

  // Effect for fetching the benchmark data whenever the selected month changes
  useEffect(() => {
    if (selectedGroupId && selectedMonth) {
      setLoading(true);
      const monthId = dayjs(selectedMonth, MONTH_ID_FORMAT).format('YYYYMM');
      fetchBudgetBenchmark(selectedGroupId, monthId)
        .then(data => {
          setBenchmarkData(data);
        })
        .catch(err => {
          console.error('Failed to fetch budget data:', err);
          setError('Failed to load budget data.');
          setBenchmarkData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedGroupId, selectedMonth]);

  // Effect to update the selected group when the initialGroupId from the URL changes
  useEffect(() => {
    if (initialGroupId) {
      setSelectedGroupId(initialGroupId);
    }
  }, [initialGroupId]);

  const handleGroupChange = (event: any) => {
    const newGroupId = event.target.value as string;
    router.push(`/groups/${newGroupId}/budget`);
  };

  const handleMonthChange = (event: any) => {
    // Simply update the state. The useEffect hook will handle fetching the data.
    setSelectedMonth(event.target.value as string);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
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