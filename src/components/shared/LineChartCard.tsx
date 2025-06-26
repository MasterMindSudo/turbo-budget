// src/components/shared/LineChartCard.tsx
'use client';

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';

interface LineChartCardProps {
  title: string;
  data: { date: string; expenses: number }[];
  dataKey: string; // The key from data objects to plot on Y-axis
  lineColor?: string;
  secondaryLineColor?: string; // For the grey line in expense trend
  chartHeight?: number;
}

const LineChartCard: React.FC<LineChartCardProps> = ({
  title,
  data,
  dataKey,
  lineColor,
  secondaryLineColor = '#bdbdbd',
  chartHeight = 200,
}) => {
  const theme = useTheme();
  const defaultLineColor = lineColor || theme.palette.primary.main;

  // Custom Tooltip content to format date and value
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dateLabel = moment(label).format('MMM DD'); // Format for display
      const value = payload[0].value;
      return (
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            p: 1,
            borderRadius: 1,
            boxShadow: 2,
            fontSize: '0.8rem',
            color: 'text.primary',
          }}
        >
          <Typography variant="body2" fontWeight="bold">{`Date: ${dateLabel}`}</Typography>
          <Typography variant="body2">{`${title}: $${value.toFixed(2)}`}</Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ mt: 3, height: chartHeight, width: '100%' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <XAxis
            dataKey="date"
            tickFormatter={(tick) => moment(tick).format('MMM DD')} // Format X-axis labels
            tickLine={false}
            axisLine={false}
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis hide domain={['dataMin', 'dataMax']} /> {/* Hide Y-axis as per screenshot */}
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={defaultLineColor}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          {/* Secondary line, e.g., for showing previous period or budget */}
          {secondaryLineColor && (
            <Line
              type="monotone"
              dataKey={dataKey} // Assuming secondary line uses same data for simplicity for now
              stroke={secondaryLineColor}
              strokeWidth={2}
              dot={false}
              activeDot={false}
              strokeDasharray="3 3" // Optional: dashed line for distinction
              opacity={0.7}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChartCard;