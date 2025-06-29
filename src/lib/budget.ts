
// /Users/kevinlam/Projects/turbo-budget/src/lib/budget.ts
import { firestore } from './firebase' // Assuming Admin SDK initialized
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { format, subMonths } from 'date-fns'

export interface MonthlySpend {
  id: string // yyyyMM
  total: number
  categories: Record<string, number>
  calculatedAt: Date
}

export interface BenchmarkData {
  thisMonth?: MonthlySpend
  sixMonthAvg: number
  categoryAvgs: Record<string, number>
  monthlyHistory: MonthlySpend[]
}

// TODO ⇢ Firebase: Replace mock data with actual Firestore implementation
const MOCK_CATEGORIES = {
  groceries: { name: 'Groceries', icon: '🍎' },
  utilities: { name: 'Utilities', icon: '💡' },
  transport: { name: 'Transport', icon: '🚗' },
  eating_out: { name: 'Eating Out', icon: '🍔' },
  entertainment: { name: 'Entertainment', icon: '🎬' },
}

// TODO ⇢ Firebase: Replace mock data generation with actual Firestore queries.
const generateMockData = (monthId: string): MonthlySpend => {
  const date = new Date(`${monthId.slice(0, 4)}-${monthId.slice(4, 6)}-01`)
  const total = 1800 + Math.random() * 800 // 1800-2600
  return {
    id: monthId,
    total,
    categories: {
      groceries: total * 0.4 + Math.random() * 100,
      utilities: total * 0.2 + Math.random() * 50,
      transport: total * 0.15 + Math.random() * 50,
      eating_out: total * 0.15 + Math.random() * 100,
      entertainment: total * 0.1 + Math.random() * 80,
    },
    calculatedAt: date,
  }
}

export async function fetchBudgetBenchmark(
  groupId: string,
  monthId: string,
): Promise<BenchmarkData> {
  // TODO ⇢ Firebase: This function will use the Admin SDK on the server.
  console.log(`Fetching budget benchmark for group ${groupId}, month ${monthId}`)

  const now = new Date()
  const previousSixMonths: string[] = []
  for (let i = 1; i <= 6; i++) {
    previousSixMonths.push(format(subMonths(now, i), 'yyyyMM'))
  }

  // In a real scenario, you'd fetch these from Firestore
  const thisMonth = generateMockData(monthId)
  const historicalData = previousSixMonths.map(generateMockData)

  const validDocs = historicalData.filter(doc => doc.total > 0)
  const numMonths = validDocs.length

  if (numMonths === 0) {
    return {
      thisMonth,
      sixMonthAvg: 0,
      categoryAvgs: {},
      monthlyHistory: [thisMonth],
    }
  }

  const totalSum = validDocs.reduce((acc, doc) => acc + doc.total, 0)
  const sixMonthAvg = totalSum / numMonths

  const categorySums: Record<string, number> = {}
  validDocs.forEach(doc => {
    for (const catId in doc.categories) {
      if (Object.prototype.hasOwnProperty.call(doc.categories, catId)) {
        categorySums[catId] = (categorySums[catId] || 0) + doc.categories[catId]
      }
    }
  })

  const categoryAvgs: Record<string, number> = {}
  for (const catId in categorySums) {
    categoryAvgs[catId] = categorySums[catId] / numMonths
  }

  return {
    thisMonth,
    sixMonthAvg,
    categoryAvgs,
    monthlyHistory: [...historicalData.reverse(), thisMonth],
  }
}
