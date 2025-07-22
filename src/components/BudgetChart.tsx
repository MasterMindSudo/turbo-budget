// // /Users/kevinlam/Projects/turbo-budget/src/components/BudgetChart.tsx
// 'use client'

// import React, { useState } from 'react'
// import dynamic from 'next/dynamic'
// import {
//   Box,
//   Paper,
//   Typography,
//   Collapse,
//   IconButton,
//   useTheme,
// } from '@mui/material'
// import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
// import { MonthlySpend } from '@/lib/budget'
// import dayjs from 'dayjs'
// import type { Props as ResponsiveContainerProps } from 'recharts/types/component/ResponsiveContainer';
// import type { Props as LineChartProps } from 'recharts/types/chart/LineChart';
// import type { CartesianGridProps } from 'recharts/types/cartesian/CartesianGrid';
// import type { XAxisProps } from 'recharts/types/cartesian/XAxis';
// import type { YAxisProps } from 'recharts/types/cartesian/YAxis';
// import type { TooltipProps } from 'recharts/types/component/Tooltip';
// import type { LegendProps } from 'recharts/types/component/Legend';
// import type { LineProps } from 'recharts/types/cartesian/Line';

// // Dynamically import Recharts to reduce initial bundle size
// const ResponsiveContainer = dynamic<ResponsiveContainerProps>(
//   () => import('recharts').then(mod => mod.ResponsiveContainer),
//   { ssr: false },
// );
// const LineChart = dynamic<LineChartProps>(
//   () => import('recharts').then(mod => mod.LineChart),
//   { ssr: false },
// );
// const CartesianGrid = dynamic<CartesianGridProps>(
//   () => import('recharts').then(mod => mod.CartesianGrid),
//   { ssr: false },
// );
// const XAxis = dynamic<XAxisProps>(
//   () => import('recharts').then(mod => mod.XAxis),
//   { ssr: false },
// );
// const YAxis = dynamic<YAxisProps>(
//   () => import('recharts').then(mod => mod.YAxis),
//   { ssr: false },
// );
// const Tooltip = dynamic<TooltipProps<any, any>>(
//   () => import('recharts').then(mod => mod.Tooltip),
//   { ssr: false },
// );
// const Legend = dynamic<LegendProps>(
//   () => import('recharts').then(mod => mod.Legend),
//   { ssr: false },
// );
// const Line = dynamic<LineProps>(
//   () => import('recharts').then(mod => mod.Line),
//   { ssr: false },
// );

// interface BudgetChartProps {
//   thisMonthHistory: MonthlySpend[]
//   sixMonthAvg: number
// }

// interface ChartData {
//   name: string;
//   Spent: number;
//   '6-Mo Avg': number;
// }

// const BudgetChart: React.FC<BudgetChartProps> = ({ thisMonthHistory, sixMonthAvg }) => {
//   const theme = useTheme()
//   const [expanded, setExpanded] = useState(true)

//   const chartData: ChartData[] = thisMonthHistory.map(item => ({
//     name: dayjs(item.id).format('MMM'),
//     Spent: item.total,
//     '6-Mo Avg': sixMonthAvg,
//   }))

//   return (
//     <Paper sx={{ borderRadius: 3, p: 2, boxShadow: 3, overflow: 'hidden' }}>
//       <Box
//         sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
//         onClick={() => setExpanded(!expanded)}
//       >
//         <Typography variant="h6" component="h3" sx={{ pl: 2 }}>
//           Monthly Trend
//         </Typography>
//         <IconButton
//           sx={{
//             transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
//             transition: theme.transitions.create('transform', {
//               duration: theme.transitions.duration.shortest,
//             }),
//           }}
//         >
//           <ExpandMoreIcon />
//         </IconButton>
//       </Box>
//       <Collapse in={expanded}>
//         <Box sx={{ height: 300, pt: 2, pr: 2 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//               <XAxis dataKey="name" tickLine={false} axisLine={false} />
//               <YAxis tickLine={false} axisLine={false} tickFormatter={val => `${val}`}/>
//               <Tooltip
//                 formatter={(value: number) => `${value.toFixed(2)}`}
//                 cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
//               />
//               <Legend />
//               <Line
//                 type="monotone"
//                 dataKey="Spent"
//                 stroke={theme.palette.primary.main}
//                 strokeWidth={3}
//                 dot={{ r: 5 }}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="6-Mo Avg"
//                 stroke={theme.palette.secondary.main}
//                 strokeWidth={2}
//                 strokeDasharray="5 5"
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </Box>
//       </Collapse>
//     </Paper>
//   )
// }

// export default BudgetChart
