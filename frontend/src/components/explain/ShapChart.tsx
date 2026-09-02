import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface ShapChartProps {
  data: { feature: string; contribution: number }[];
}

export const ShapChart: React.FC<ShapChartProps> = ({ data }) => {
  // Format data for Recharts
  const chartData = data.map(item => ({
    name: item.feature,
    value: item.contribution,
    // Add a positive/negative flag for conditional styling if needed, though Cell can handle it
    isPositive: item.contribution > 0
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-secondary p-3 rounded-lg shadow-md">
          <p className="text-xs font-semibold text-textSecondary uppercase mb-1">{data.name}</p>
          <p className="text-sm font-bold font-mono">
            {data.value > 0 ? '+' : ''}{data.value.toFixed(3)} Risk points
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
        >
          <XAxis type="number" domain={[-0.5, 0.5]} tick={{ fill: '#687276', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
          <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#182124', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <ReferenceLine x={0} stroke="#182124" strokeWidth={1} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isPositive ? '#B95D63' : '#4E9B78'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
