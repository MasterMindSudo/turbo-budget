
import { db } from './firebase'
import { collection, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore'
import { format, subMonths, startOfMonth, endOfMonth, isValid } from 'date-fns'
import dayjs from 'dayjs'
import { MONTH_ID_FORMAT } from '@/constants'

export interface MonthlySpend {
  id: string // yyyyMM
  total: number
  categories: Record<string, number>
}

export interface BenchmarkData {
  thisMonth?: MonthlySpend
  sixMonthAvg: number
  categoryAvgs: Record<string, number>
  monthlyHistory: MonthlySpend[]
}

/**
 * Robustly converts Firestore‐stored values into a valid JS `Date`.
 *
 * Accepts:
 *   • Firestore `Timestamp`
 *   • Milliseconds since epoch (`number`)
 *   • ISO/String dates (`string`)
 *   • Native `Date`
 *   • Plain object that looks like a Firestore timestamp
 *     (i.e. has `seconds` & `nanoseconds` numeric properties)
 *
 * Returns `null` for anything that cannot be parsed to a valid date.
 */
export const parseDate = (dateValue: unknown): Date | null => {
  // Firestore Timestamp instance
  if (dateValue instanceof Timestamp) {
    return dateValue.toDate();
  }

  // Milliseconds since epoch
  if (typeof dateValue === 'number') {
    const date = new Date(dateValue);
    return isValid(date) ? date : null;
  }

  // ISO‑8601 string or any string accepted by Date()
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    return isValid(date) ? date : null;
  }

  // Native JS Date
  if (dateValue instanceof Date) {
    return isValid(dateValue) ? dateValue : null;
  }

  // Plain object that looks like { seconds: number, nanoseconds: number }
  if (
    dateValue &&
    typeof dateValue === 'object' &&
    'seconds' in (dateValue as any) &&
    'nanoseconds' in (dateValue as any)
  ) {
    const { seconds, nanoseconds } = dateValue as { seconds: number; nanoseconds: number };
    const millis = seconds * 1000 + Math.floor(nanoseconds / 1e6);
    const date = new Date(millis);
    return isValid(date) ? date : null;
  }

  // Anything else → unsupported
  return null;
};

/**
 * Fetches a unique, sorted list of months ('yyyy-MM') that have expenses for a given group.
 * It robustly handles various date formats (Timestamp, ISO string, JS Date) and logs warnings for invalid entries.
 * The list is sorted in descending chronological order.
 * @param groupId The ID of the group to fetch expense months for.
 * @returns A promise that resolves to an array of month strings, sorted descending.
 */
export async function getAvailableMonths(groupId: string): Promise<string[]> {
  console.log(`[getAvailableMonths] Fetching for group: ${groupId}`);
  const expensesRef = collection(db, `groups/${groupId}/expenses`);
  // Order by date descending to get the most recent months first
  const q = query(expensesRef, orderBy('date', 'desc'));

  const querySnapshot = await getDocs(q);
  
  const months = new Set<string>();
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const parsedDate = parseDate(data.date);

    if (parsedDate) {
      const monthString = dayjs(parsedDate).format(MONTH_ID_FORMAT);
      if (!months.has(monthString)) {
        console.log(`[getAvailableMonths] Found month: ${monthString}`);
        months.add(monthString);
      }
    } else {
      console.warn(`[getAvailableMonths] Skipping expense doc '${doc.id}' due to invalid or missing date.`);
    }
  });

  const sortedMonths = Array.from(months); // Already sorted due to query order
  console.log(`[getAvailableMonths] Returning sorted months:`, sortedMonths);
  return sortedMonths;
}

export async function fetchBudgetBenchmark(
  groupId: string,
  monthId: string, // e.g., '202310'
): Promise<BenchmarkData> {
  console.log(`[fetchBudgetBenchmark] Fetching for group ${groupId}, month ${monthId}`);

  const currentMonth = dayjs(monthId, MONTH_ID_FORMAT)
  const currentMonthStart = currentMonth.startOf('month');
  const currentMonthEnd = currentMonth.endOf('month');

  const sevenMonthsAgo = currentMonth.subtract(7, 'month'); // Start of the 7th month back

  const expensesRef = collection(db, `groups/${groupId}/expenses`);
  const q = query(
    expensesRef,
    where('date', '>=', Timestamp.fromDate(sevenMonthsAgo.toDate())),
    where('date', '<=', Timestamp.fromDate(currentMonthEnd.toDate()))
  );

  const querySnapshot = await getDocs(q);
  const allExpenses: { amount: number; date: Date; category?: string }[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    allExpenses.push({
      amount: data.amount,
      date: (data.date as Timestamp).toDate(),
      category: data.category,
    });
  });
  console.log('[fetchBudgetBenchmark] Fetched expenses:', allExpenses);

  const monthlyData: Record<string, MonthlySpend> = {};

  for (let i = -1; i < 6; i++) {
    const month = currentMonth.subtract(i, 'month');
    const monthKey = month.format(MONTH_ID_FORMAT);
    monthlyData[monthKey] = {
      id: monthKey,
      total: 0,
      categories: {},
    };
  }

  allExpenses.forEach((expense) => {
    const expenseMonthId = dayjs(expense.date).format(MONTH_ID_FORMAT);
    if (monthlyData[expenseMonthId]) {
      monthlyData[expenseMonthId].total += expense.amount;
      const category = expense.category || 'uncategorized';
      monthlyData[expenseMonthId].categories[category] =
        (monthlyData[expenseMonthId].categories[category] || 0) + expense.amount;
    }
  });

  const monthlyHistory: MonthlySpend[] = Object.values(monthlyData).sort((a, b) => a.id.localeCompare(b.id));
  console.log('[fetchBudgetBenchmark] monthlyHistory:', monthlyHistory);

  const thisMonth = monthlyHistory.find(m => m.id === monthId);
  console.log('[fetchBudgetBenchmark] thisMonth:', thisMonth);

  const historicalMonths = monthlyHistory.filter(m => m.id !== monthId);
  const sixMonthAvg = historicalMonths.length > 0
    ? historicalMonths.reduce((sum, m) => sum + m.total, 0) / historicalMonths.length
    : 0;

  const categorySums: Record<string, number> = {};
  historicalMonths.forEach(month => {
    for (const catId in month.categories) {
      if (Object.prototype.hasOwnProperty.call(month.categories, catId)) {
        categorySums[catId] = (categorySums[catId] || 0) + month.categories[catId];
      }
    }
  });

  const categoryAvgs: Record<string, number> = {};
  for (const catId in categorySums) {
    categoryAvgs[catId] = categorySums[catId] / historicalMonths.length;
  }

  const result = {
    thisMonth,
    sixMonthAvg,
    categoryAvgs,
    monthlyHistory,
  };
  console.log('[fetchBudgetBenchmark] Returning data:', result);
  return result;
}
