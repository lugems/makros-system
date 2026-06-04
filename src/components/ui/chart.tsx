import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  [key: string]: string | number;
}

interface ChartProps {
  data: ChartData[];
  xAxisKey: string;
  yAxisKey: string;
}

export const Chart: React.FC<ChartProps> = ({ data, xAxisKey, yAxisKey }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={xAxisKey} stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            labelStyle={{ color: '#F9FAFB' }}
          />
          <Legend wrapperStyle={{ color: '#F9FAFB' }} />
          <Line type="monotone" dataKey={yAxisKey} stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
