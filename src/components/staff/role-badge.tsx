import { UserRole } from '@/types/staff';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const ROLE_COLORS: Record<UserRole, string> = {
  "Makros System Owner": "bg-red-500/10 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50",
  "Workshop Manager": "bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50",
  "Receptionist": "bg-green-500/10 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50",
  "Mechanic": "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30",
  "Inventory Officer": "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900/50",
  "Accountant": "bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50",
  "Customer": "bg-slate-500/10 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-800",
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded shadow-sm", 
        ROLE_COLORS[role] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {role}
    </Badge>
  );
}
