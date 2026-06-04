'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CommunicationStatus } from '@/types/communication';
import { cn } from '@/lib/utils';

interface CommunicationStatusBadgeProps {
  status: CommunicationStatus;
  className?: string;
}

const statusStyles: Record<CommunicationStatus, string> = {
  "Open": "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50",
  "Pending Response": "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50",
  "Resolved": "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/50",
  "Closed": "bg-slate-500/10 text-slate-500 border-slate-200 dark:border-slate-800",
};

export function CommunicationStatusBadge({ status, className }: CommunicationStatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm",
        statusStyles[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}
