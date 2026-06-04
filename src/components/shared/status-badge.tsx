import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

const statusColors: { [key: string]: string } = {
  // Booking Status
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  'Checked In': 'bg-indigo-100 text-indigo-800',
  Cancelled: 'bg-gray-100 text-gray-800',
  Completed: 'bg-green-100 text-green-800',
  'No Show': 'bg-red-100 text-red-800',

  // Job Card Status
  Received: 'bg-gray-200 text-gray-800',
  Diagnosing: 'bg-yellow-200 text-yellow-900',
  'Waiting for Approval': 'bg-orange-200 text-orange-900',
  'Waiting for Parts': 'bg-purple-200 text-purple-900',
  'In Progress': 'bg-blue-200 text-blue-900',
  'Quality Check': 'bg-teal-200 text-teal-900',
  Invoiced: 'bg-cyan-200 text-cyan-900',
  Paid: 'bg-green-200 text-green-900',
  Delivered: 'bg-gray-300 text-gray-900',

  // Payment Status
  Unpaid: 'bg-red-100 text-red-800',
  'Partially Paid': 'bg-yellow-100 text-yellow-800',
  Overdue: 'bg-red-200 text-red-900',

  // General Status
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <Badge className={cn('border-transparent', colorClass)}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
