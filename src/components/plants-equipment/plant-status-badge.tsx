import { Badge } from '@/components/ui/badge';
import { PlantStatus } from '@/types/plant-equipment';
import { cn } from '@/lib/utils';

interface PlantStatusBadgeProps {
  status: PlantStatus;
  className?: string;
}

const statusStyles: Record<PlantStatus, string> = {
  'Active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
  'Under Repair': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
  'Under Maintenance': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200',
  'Out of Service': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
  'Decommissioned': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200',
};

export function PlantStatusBadge({ status, className }: PlantStatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-md shadow-sm', 
        statusStyles[status] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {status}
    </Badge>
  );
}
