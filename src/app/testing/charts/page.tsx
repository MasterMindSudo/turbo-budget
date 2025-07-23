// src/app/testing/charts/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { Container, Typography, Box, Paper, Grid, FormControl, InputLabel, Select, MenuItem, TextField, useTheme } from '@mui/material';
import { useBudget } from '@/context/BudgetProvider';
import dayjs from 'dayjs';
import { MONTH_ID_FORMAT } from '@/constants';

import { categories as categoryData } from '@/lib/data';
import { Timestamp } from 'firebase/firestore';

// Helper to safely convert a Firestore Timestamp or FieldValue to a Date
const toDate = (dateValue: any): Date | null => {
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  return null;
};

const ChartTestingPage: React.FC = () => {
  const { state } = useBudget();
  const { groups } = state;
  const theme = useTheme();

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [budgetGoal, setBudgetGoal] = useState<string | number>('');

  const handleGroupChange = (event: any) => {
    setSelectedGroupId(event.target.value as string);
    setSelectedMonth(''); // Reset month when group changes
  };

  const handleMonthChange = (event: any) => {
    setSelectedMonth(event.target.value as string);
  };

  const handleGoalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setBudgetGoal(raw === '' ? '' : Number(raw));
  };

  const { availableMonths, chartData, gaugeValue, stackedBarData } = useMemo(() => {
    if (!selectedGroupId) {
      return { 
        availableMonths: [], 
        chartData: [], 
        gaugeValue: 0, 
        stackedBarData: { dataset: [], series: [], xAxis: [] } 
      };
    }

    const group = groups.find(g => g.id === selectedGroupId);
    if (!group) {
      return { 
        availableMonths: [], 
        chartData: [], 
        gaugeValue: 0, 
        stackedBarData: { dataset: [], series: [], xAxis: [] } 
      };
    }
    
    const safeExpenses = group.expenses.map(e => ({ ...e, date: toDate(e.date) })).filter(e => e.date !== null);

    // --- Data for Month Selector and Single Month Charts ---
    const months = [...new Set(safeExpenses.map(e => dayjs(e.date).format(MONTH_ID_FORMAT)))].sort((a, b) => b.localeCompare(a));
    const filteredExpenses = safeExpenses.filter(e => dayjs(e.date).format(MONTH_ID_FORMAT) === selectedMonth);
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      const categoryId = expense.category || 'Uncategorized';
      const categoryName = categoryData.find(c => c.id === categoryId)?.name || categoryId;
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    const newChartData = Object.entries(categoryTotals).map(([category, total]) => ({ category, total }));
    const totalSpend = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const numericGoal = budgetGoal === '' ? 0 : Number(budgetGoal);
    const newGaugeValue =
      numericGoal === 0 ? 0 : Math.round((totalSpend / numericGoal) * 100);

    // --- Data for Stacked Bar Chart ---
    const monthlyCategoryTotals: Record<string, Record<string, number>> = {};
    const allCategories = new Set<string>();

    safeExpenses.forEach(expense => {
        const month = dayjs(expense.date).format(MONTH_ID_FORMAT);
        const categoryId = expense.category || 'Uncategorized';
        const categoryName = categoryData.find(c => c.id === categoryId)?.name || categoryId;
        allCategories.add(categoryName);

        if (!monthlyCategoryTotals[month]) {
            monthlyCategoryTotals[month] = {};
        }
        monthlyCategoryTotals[month][categoryName] = (monthlyCategoryTotals[month][categoryName] || 0) + expense.amount;
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
  }, [selectedGroupId, selectedMonth, groups, budgetGoal]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        MUI Chart Testing Page
      </Typography>

      {/* Selectors */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="group-select-label">Select Group</InputLabel>
            <Select
              labelId="group-select-label"
              value={selectedGroupId}
              label="Select Group"
              onChange={handleGroupChange}
              disabled={groups.length === 0}
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
              value={selectedMonth}
              label="Select Month"
              onChange={handleMonthChange}
              disabled={availableMonths.length === 0}
            >
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
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              {chartData.length > 0 ? (
                <BarChart
                  dataset={chartData}
                  yAxis={[{ scaleType: 'band', dataKey: 'category' }]}
                  series={[{ dataKey: 'total', label: 'Total Spend' }]}
                  layout="horizontal"
                  height={300}
                  margin={{ top: 10, bottom: 30, left: 100, right: 10 }}
                />
              ) : (
                <Typography sx={{ textAlign: 'center', pt: 8 }}>Select a group and month to see data.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Budget Goal Progress
            </Typography>
            <TextField
              label="Budget Goal ($)"
              type="number"
              variant="outlined"
              value={budgetGoal}
              onChange={handleGoalChange}
              sx={{ mt: 2, mb: 2, width: '50%' }}
            />
            <Box sx={{ height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                    fill: '#f4f4f4',
                  },
                }}
                text={`${gaugeValue}%`}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Stacked Bar Chart */}
      <Grid container spacing={4} sx={{ mt: 0 }}>
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
                    />
                ) : (
                    <Typography sx={{ textAlign: 'center', pt: 8 }}>Select a group to see monthly history.</Typography>
                )}
                </Box>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChartTestingPage;
