import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ServiceStatus } from '@/types/makros-service';
import { cn } from '@/lib/utils';

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
  className?: string;
}

const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({ status, className }) => {
  const statusStyles = {
    Active: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50',
    Inactive: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50',
  };

  return (
    <Badge 
        variant="outline" 
        className={cn(
            "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm",
            statusStyles[status],
            className
        )}
    >
      {status}
    </Badge>
  );
};

export default ServiceStatusBadge;
