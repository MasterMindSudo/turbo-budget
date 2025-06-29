
// /Users/kevinlam/Projects/turbo-budget/src/app/groups/[groupId]/budget/page.tsx
import { fetchBudgetBenchmark } from '@/lib/budget'
import BudgetSummaryCard from '@/components/BudgetSummaryCard'
import CategoryList from '@/components/CategoryList'
import BudgetChart from '@/components/BudgetChart'
import { Typography, Container, Box } from '@mui/material'
import { format } from 'date-fns'

type BudgetPageProps = {
  params: { groupId: string }
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const { groupId } = params
  const currentMonthId = format(new Date(), 'yyyyMM')
  
  // TODO ⇢ Firebase
  const {
    thisMonth,
    sixMonthAvg,
    categoryAvgs,
    monthlyHistory,
  } = await fetchBudgetBenchmark(groupId, currentMonthId)

  if (!thisMonth) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Budget Analysis
        </Typography>
        <Typography>
          Not enough data to display budget analysis. Check back after more
          spending has been recorded.
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Budget vs. 6-Month Average
      </Typography>

      <BudgetSummaryCard thisMonth={thisMonth} sixMonthAvg={sixMonthAvg} />

      <Box sx={{ my: 4 }}>
        <BudgetChart
          thisMonthHistory={monthlyHistory}
          sixMonthAvg={sixMonthAvg}
        />
      </Box>

      <CategoryList thisMonth={thisMonth} categoryAvgs={categoryAvgs} />

      <Typography
        variant="caption"
        display="block"
        textAlign="center"
        sx={{ mt: 4, color: 'text.secondary' }}
      >
        Targets are based on a 6-month rolling average of spending.
      </Typography>
    </Container>
  )
}
