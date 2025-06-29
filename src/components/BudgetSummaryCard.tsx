
// /Users/kevinlam/Projects/turbo-budget/src/components/BudgetSummaryCard.tsx
'use client'

import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
} from '@mui/material'
import { MonthlySpend } from '@/lib/budget'
import { ArrowUpward, ArrowDownward } from '@mui/icons-material'

interface BudgetSummaryCardProps {
  thisMonth: MonthlySpend
  sixMonthAvg: number
}

const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({ thisMonth, sixMonthAvg }) => {
  const theme = useTheme()
  if (sixMonthAvg === 0) return null

  const { total: currentSpend } = thisMonth
  const percentage = (currentSpend / sixMonthAvg) * 100
  const difference = currentSpend - sixMonthAvg

  let status: 'success' | 'warning' | 'error' = 'success'
  if (percentage > 115) {
    status = 'error'
  } else if (percentage > 85) {
    status = 'warning'
  }

  const statusColor = theme.palette[status].main

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="overline" color="text.secondary">
          Overall Spending vs. 6-Mo Average
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            my: 2,
            color: statusColor,
          }}
        >
          <Typography variant="h2" component="p" sx={{ fontWeight: 'bold' }}>
            {percentage.toFixed(0)}%
          </Typography>
        </Box>
        <Chip
          icon={difference > 0 ? <ArrowUpward /> : <ArrowDownward />}
          label={`$${Math.abs(difference).toFixed(2)} ${difference > 0 ? 'Over' : 'Under'}`}
          color={status}
          variant="outlined"
        />
      </CardContent>
    </Card>
  )
}

export default BudgetSummaryCard
