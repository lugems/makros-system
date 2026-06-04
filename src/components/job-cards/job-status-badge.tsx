import { Badge } from '@/components/ui/badge';
import { JobCardStatus } from '@/types/job-card';
import { cn } from '@/lib/utils';

interface JobStatusBadgeProps {
  status: JobCardStatus;
  className?: string;
}

const statusStyles: Record<JobCardStatus, string> = {
  [JobCardStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
  [JobCardStatus.Received]: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200',
  [JobCardStatus.Diagnosing]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
  [JobCardStatus.WaitingForApproval]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
  [JobCardStatus.WaitingForParts]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200',
  [JobCardStatus.InProgress]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
  [JobCardStatus.QualityCheck]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
  [JobCardStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
  [JobCardStatus.Invoiced]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200',
  [JobCardStatus.Paid]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
  [JobCardStatus.Delivered]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200',
  [JobCardStatus.Cancelled]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
};

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
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
