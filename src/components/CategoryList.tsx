
// /Users/kevinlam/Projects/turbo-budget/src/components/CategoryList.tsx
'use client'

import React from 'react'
import {
  List,
  Typography,
  Paper,
  Box
} from '@mui/material'
import CategoryRow from './CategoryRow'
import { MonthlySpend } from '@/lib/budget'

interface CategoryListProps {
  thisMonth: MonthlySpend
  categoryAvgs: Record<string, number>
}

import { categories } from '@/lib/data';

const CategoryList: React.FC<CategoryListProps> = ({ thisMonth, categoryAvgs }) => {
  const sortedCategories = Object.entries(thisMonth.categories)
    .sort(([, a], [, b]) => b - a) // Sort by amount spent, descending

  return (
    <Paper sx={{ borderRadius: 3, p: 2, boxShadow: 3 }}>
        <Typography variant="h6" component="h3" sx={{ px: 2, pt: 2, pb: 1 }}>
            Spending by Category
        </Typography>
      <List disablePadding>
        {sortedCategories.map(([catId, amount]) => {
          const category = categories.find(c => c.id === catId);
          return (
            <CategoryRow
              key={catId}
              icon={category?.emoji || ''}
              name={category?.name || 'Uncategorized'}
              spent={amount}
              average={categoryAvgs[catId] || 0}
            />
          );
        })}
      </List>
    </Paper>
  )
}

export default CategoryList
