'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CommunicationPriority } from '@/types/communication';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface CommunicationPriorityBadgeProps {
  priority: CommunicationPriority;
  className?: string;
}

export function CommunicationPriorityBadge({ priority, className }: CommunicationPriorityBadgeProps) {
  const getStyles = () => {
    switch (priority) {
      case 'Urgent': return "bg-red-500 text-white border-none shadow-lg shadow-red-500/20";
      case 'High': return "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/50";
      case 'Low': return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1.5",
        getStyles(),
        className
      )}
    >
      {(priority === 'Urgent' || priority === 'High') && <AlertTriangle className="h-2.5 w-2.5" />}
      {priority}
    </Badge>
  );
}
