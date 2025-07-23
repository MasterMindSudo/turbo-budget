// src/app/groups/[groupId]/budget/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useBudget } from '@/context/BudgetProvider';
import { Container, Typography, Box, Paper, Grid, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, TextField, useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import dayjs from 'dayjs';
import { MONTH_ID_FORMAT } from '@/constants';
import { categories as categoryData } from '@/lib/data';
import { Timestamp } from 'firebase/firestore';
import { debounce } from 'lodash';

// Helper to safely convert a Firestore Timestamp or FieldValue to a Date
const toDate = (dateValue: any): Date | null => {
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  return null;
};

const BudgetPage = () => {
  const params = useParams();
  const groupId = params?.groupId as string;
  const { getGroupById, getExpensesByGroupId, updateGroupBudget } = useBudget();
  const theme = useTheme();

  const group = getGroupById(groupId);
  const expenses = getExpensesByGroupId(groupId);

  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [budgetGoal, setBudgetGoal] = useState<string | number>('');

  // Debounced function to update Firestore
  const debouncedUpdateBudget = useMemo(
    () => debounce((newBudget: number) => {
      if (groupId && selectedMonth) {
        updateGroupBudget(groupId, selectedMonth, newBudget);
      }
    }, 1000), // 1-second debounce delay
    [groupId, selectedMonth, updateGroupBudget]
  );

  useEffect(() => {
    if (group && selectedMonth) {
      const monthlyBudget = group.budget?.[selectedMonth] ?? '';
      setBudgetGoal(monthlyBudget);
    } else {
      setBudgetGoal('');
    }
  }, [group, selectedMonth]);

  const handleMonthChange = (event: any) => {
    setSelectedMonth(event.target.value as string);
  };

  const handleGoalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const numericValue = rawValue === '' ? '' : Number(rawValue);
    setBudgetGoal(numericValue);
    if (numericValue !== '') {
      debouncedUpdateBudget(numericValue);
    }
  };

  const { availableMonths, chartData, gaugeValue, stackedBarData } = useMemo(() => {
    if (!group) {
      return { 
        availableMonths: [], 
        chartData: [], 
        gaugeValue: 0, 
        stackedBarData: { dataset: [], series: [], xAxis: [] } 
      };
    }

    const safeExpenses = expenses.map(e => ({ ...e, date: toDate(e.date) })).filter(e => e.date !== null);

    // --- Data for Month Selector and Single Month Charts ---
    const months = [...new Set(safeExpenses.map(e => dayjs(e.date).format(MONTH_ID_FORMAT)))].sort((a, b) => b.localeCompare(a));
    
    const filteredExpenses = selectedMonth 
      ? safeExpenses.filter(e => dayjs(e.date).format(MONTH_ID_FORMAT) === selectedMonth)
      : safeExpenses; // If no month selected, use all expenses for some charts

    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      const categoryId = expense.category || 'Uncategorized';
      const categoryName = categoryData.find(c => c.id === categoryId)?.name || categoryId;
      const amount = expense.amountInBaseCurrency || expense.amount;
      acc[categoryName] = (acc[categoryName] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    const newChartData = Object.entries(categoryTotals).map(([category, total]) => ({ category, total }));
    const totalSpendInMonth = filteredExpenses.reduce((sum, e) => sum + (e.amountInBaseCurrency || e.amount), 0);
    const numericGoal = budgetGoal === '' ? 0 : Number(budgetGoal);
    const newGaugeValue =
      numericGoal === 0 ? 0 : Math.round((totalSpendInMonth / numericGoal) * 100);

    // --- Data for Stacked Bar Chart ---
    const monthlyCategoryTotals: Record<string, Record<string, number>> = {};
    const allCategories = new Set<string>();

    safeExpenses.forEach(expense => {
        const month = dayjs(expense.date).format(MONTH_ID_FORMAT);
        const categoryId = expense.category || 'Uncategorized';
        const categoryName = categoryData.find(c => c.id === categoryId)?.name || categoryId;
        const amount = expense.amountInBaseCurrency || expense.amount;
        allCategories.add(categoryName);

        if (!monthlyCategoryTotals[month]) {
            monthlyCategoryTotals[month] = {};
        }
        monthlyCategoryTotals[month][categoryName] = (monthlyCategoryTotals[month][categoryName] || 0) + amount;
    });

    const stackedChartDataset = Object.keys(monthlyCategoryTotals).map(month => ({
        month,
        ...monthlyCategoryTotals[month]
    })).sort((a, b) => a.month.localeCompare(b.month));

    const stackedBarSeries = Array.from(allCategories).map(category => ({
        dataKey: category,
        label: category,
        stack: 'total',
    }));

    const stackedBarXAxis = [{
        data: stackedChartDataset.map(d => dayjs(d.month, MONTH_ID_FORMAT).format('MMM YY')),
        scaleType: 'band' as const,
    }];

    const finalStackedBarData = {
        dataset: stackedChartDataset,
        series: stackedBarSeries,
        xAxis: stackedBarXAxis,
    };

    return { 
        availableMonths: months, 
        chartData: newChartData, 
        gaugeValue: newGaugeValue,
        stackedBarData: finalStackedBarData,
    };
  }, [group, expenses, selectedMonth, budgetGoal]);

  if (!group) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='text.secondary'>
          Loading group data...
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Budget for {group.name}
      </Typography>

      {/* Selectors */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="month-select-label">Select Month</InputLabel>
            <Select
              labelId="month-select-label"
              value={selectedMonth}
              label="Select Month"
              onChange={handleMonthChange}
              disabled={availableMonths.length === 0}
            >
              <MenuItem value="">
                <em>All Time</em>
              </MenuItem>
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {dayjs(month, MONTH_ID_FORMAT).format('MMMM YYYY')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category {selectedMonth ? `for ${dayjs(selectedMonth, MONTH_ID_FORMAT).format('MMMM YYYY')}` : '(All Time)'}
            </Typography>
            <Box sx={{ height: 300 }}>
              {chartData.length > 0 ? (
                <BarChart
                  dataset={chartData}
                  yAxis={[{ scaleType: 'band', dataKey: 'category' }]}
                  series={[{ dataKey: 'total', label: `Total Spend (${group.baseCurrency})`, valueFormatter: (value) => value ? value.toFixed(2) : '' }]}
                  layout="horizontal"
                  height={300}
                  margin={{ top: 10, bottom: 30, left: 120, right: 20 }}
                />
              ) : (
                <Typography sx={{ textAlign: 'center', pt: 8 }}>No expenses for this period.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Budget Goal Progress {selectedMonth ? `for ${dayjs(selectedMonth, MONTH_ID_FORMAT).format('MMMM YYYY')}` : ''}
            </Typography>
            <TextField
              label={`Budget Goal (${group.baseCurrency})`}
              type="number"
              variant="outlined"
              value={budgetGoal}
              onChange={handleGoalChange}
              sx={{ mt: 2, mb: 2, width: '50%' }}
              disabled={!selectedMonth}
            />
            <Box sx={{ height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {selectedMonth ? (
                <Gauge
                  value={gaugeValue}
                  valueMax={100}
                  startAngle={-110}
                  endAngle={110}
                  height={200}
                  sx={{
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 40,
                      transform: 'translate(0px, 0px)',
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: gaugeValue > 100 ? theme.palette.error.main : theme.palette.success.main,
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                      fill: theme.palette.grey[200],
                    },
                  }}
                  text={`${gaugeValue}%`}
                />
              ) : (
                <Typography sx={{ textAlign: 'center', pt: 4, color: 'text.secondary' }}>Select a month to set a budget goal.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                Monthly Spending History by Category
                </Typography>
                <Box sx={{ height: 400 }}>
                {stackedBarData.dataset.length > 0 ? (
                    <BarChart
                        dataset={stackedBarData.dataset}
                        xAxis={stackedBarData.xAxis}
                        series={stackedBarData.series}
                        height={400}
                        margin={{ top: 10, bottom: 30, left: 80, right: 10 }}
                        yAxis={[{ label: `Total Spend (${group.baseCurrency})` }]}
                    />
                ) : (
                    <Typography sx={{ textAlign: 'center', pt: 8 }}>No expense history to display.</Typography>
                )}
                </Box>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BudgetPage;
