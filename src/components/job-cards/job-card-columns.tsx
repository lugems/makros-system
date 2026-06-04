'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { JobCard } from '@/schemas/job-card-schema';
import { JobStatusBadge } from '@/components/job-cards/job-status-badge';
import { JobCardStatus } from '@/types/job-card';

export const columns: ColumnDef<JobCard>[] = [
  {
    accessorKey: 'customerName',
    header: 'Customer',
  },
  {
    accessorKey: 'vehicleDescription',
    header: 'Vehicle',
  },
  {
    accessorKey: 'assignedMechanicName',
    header: 'Assigned Mechanic',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.original.status as any;
        return <JobStatusBadge status={status as JobCardStatus} />;
    },
  },
  {
    accessorKey: 'totalCost',
    header: 'Total Cost',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalCost'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    cell: () => <div />
  },
];
