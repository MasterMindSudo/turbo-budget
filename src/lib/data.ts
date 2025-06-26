// src/lib/data.ts
// This file contains mock data for UI demonstration.
// This data will eventually be fetched from Firebase/Firestore.

export const categories = [
  { id: 'food', name: 'Food', emoji: '🍔' },
  { id: 'transport', name: 'Transport', emoji: '🚗' },
  { id: 'housing', name: 'Housing', emoji: '🏠' },
  { id: 'utilities', name: 'Utilities', emoji: '💡' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
  { id: 'health', name: 'Health', emoji: '💊' },
  { id: 'education', name: 'Education', emoji: '📚' },
  { id: 'other', name: 'Other', emoji: '🤷‍♀️' },
];

export const mockExpenseTrendData = [
  { date: 'Jun 1', expenses: 0 },
  { date: 'Jun 8', expenses: 400 },
  { date: 'Jun 15', expenses: 1200 },
  { date: 'Jun 22', expenses: 2500 },
  { date: 'Jun 23', expenses: 2758.97 }, // Example value matching screenshot
  { date: 'Jun 29', expenses: 3500 },
];