// src/data/mockData.ts
// This file is now less critical as mock data is inside BudgetContext.tsx for simplicity,
// but it can be expanded for more complex mock data generation or different environments.

export const categories = [
  { id: 'food', name: 'Food', emoji: '🍔' },
  { id: 'transport', name: 'Transport', emoji: '🚗' },
  { id: 'housing', name: 'Housing', emoji: '🏠' },
  { id: 'utilities', name: 'Utilities', emoji: '💡'},
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
  { id: 'health', name: 'Health', emoji: '💊' },
  { id: 'education', name: 'Education', emoji: '📚' },
  { id: 'other', name: 'Other', emoji: '🤷‍♀️' },
];

// Recharts data for cumulative expense trend (example)
export const expenseTrendData = [
  { date: 'Jun 1', expenses: 0 },
  { date: 'Jun 8', expenses: 400 },
  { date: 'Jun 15', expenses: 1200 },
  { date: 'Jun 22', expenses: 2500 },
  { date: 'Jun 23', expenses: 2758.97 }, // Example value matching screenshot
  { date: 'Jun 29', expenses: 3500 },
];