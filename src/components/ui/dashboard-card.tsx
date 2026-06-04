import React from 'react';
import { Card } from './card';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center">
          <div className="p-3 bg-gray-700 rounded-full">
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-400 font-space-grotesk">{title}</p>
            <p className="text-2xl font-bold text-white font-space-grotesk">{value}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
