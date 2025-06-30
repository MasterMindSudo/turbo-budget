
// /Users/kevinlam/Projects/turbo-budget/src/components/CategoryRow.tsx
'use client'

import React from 'react'
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  LinearProgress,
  Tooltip,
  useTheme,
} from '@mui/material'

interface CategoryRowProps {
  icon: string
  name: string
  spent: number
  average: number
}

const CategoryRow: React.FC<CategoryRowProps> = ({ icon, name, spent, average }) => {
  const theme = useTheme()
  const percentage = average > 0 ? (spent / average) * 100 : 100
  const difference = spent - average

  let progressColor: 'success' | 'warning' | 'error' = 'success'
  if (percentage > 115) {
    progressColor = 'error'
  } else if (percentage > 95) {
    progressColor = 'warning'
  }

  return (
    <ListItem sx={{ py: 1.5 }}>
      <ListItemIcon sx={{ fontSize: 28, mr: 1 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={<Typography variant="body1">{name}</Typography>}
        secondary={
          <Tooltip title={`6-Month Average: ${average.toFixed(2)}`}>
            <Box sx={{ mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)} // Cap at 100 for the bar
                color={progressColor}
                sx={{ height: 8, borderRadius: 4 }}
                aria-label={`Spending progress for ${name}`}
                aria-valuenow={spent}
                aria-valuemin={0}
                aria-valuemax={average}
              />
            </Box>
          </Tooltip>
        }
        secondaryTypographyProps={{ component: 'div' }}
      />
      <Box sx={{ textAlign: 'right', ml: 2, minWidth: 90 }}>
        <Typography variant="body1" fontWeight="medium">
          ${spent.toFixed(2)}
        </Typography>
        <Typography
          variant="caption"
          color={difference > 0 ? theme.palette.error.main : theme.palette.success.main}
        >
          {difference > 0 ? '+' : ''}${difference.toFixed(2)}
        </Typography>
      </Box>
    </ListItem>
  )
}

export default CategoryRow
