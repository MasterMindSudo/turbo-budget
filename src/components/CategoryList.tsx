
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

// TODO ⇢ Firebase: Fetch category metadata (name, icon) from a 'categories' collection
const MOCK_CATEGORIES: Record<string, { name: string; icon: string }> = {
  groceries: { name: 'Groceries', icon: '🍎' },
  utilities: { name: 'Utilities', icon: '💡' },
  transport: { name: 'Transport', icon: '🚗' },
  eating_out: { name: 'Eating Out', icon: '🍔' },
  entertainment: { name: 'Entertainment', icon: '🎬' },
  shopping: { name: 'Shopping', icon: '🛍️' },
  health: { name: 'Health', icon: '🏥' },
}

const CategoryList: React.FC<CategoryListProps> = ({ thisMonth, categoryAvgs }) => {
  const sortedCategories = Object.entries(thisMonth.categories)
    .sort(([, a], [, b]) => b - a) // Sort by amount spent, descending

  return (
    <Paper sx={{ borderRadius: 3, p: 2, boxShadow: 3 }}>
        <Typography variant="h6" component="h3" sx={{ px: 2, pt: 2, pb: 1 }}>
            Spending by Category
        </Typography>
      <List disablePadding>
        {sortedCategories.map(([catId, amount]) => (
          <CategoryRow
            key={catId}
            icon={MOCK_CATEGORIES[catId]?.icon || ''}
            name={MOCK_CATEGORIES[catId]?.name || 'Uncategorized'}
            spent={amount}
            average={categoryAvgs[catId] || 0}
          />
        ))}
      </List>
    </Paper>
  )
}

export default CategoryList
