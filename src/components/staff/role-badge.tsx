import { UserRole } from '@/types/staff';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const ROLE_COLORS: Record<UserRole, string> = {
  "Makros System Owner": "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50",
  "Workshop Manager": "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/50",
  "Receptionist": "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/50",
  "Senior Mechanic / Lead Mechanic": "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  "Mechanic": "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20",
  "Diagnostic Technician": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Auto-Wiring Technician": "bg-teal-500/10 text-teal-600 border-teal-200",
  "Welding Lead Technician": "bg-slate-900 text-white border-none",
  "Welding Technician": "bg-slate-500/10 text-slate-600 border-slate-200",
  "Auto Body / Panel Beater": "bg-rose-500/10 text-rose-600 border-rose-200",
  "Painter": "bg-pink-500/10 text-pink-600 border-pink-200",
  "Tyre & Wheel Technician": "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  "Car Wash / Detailing Technician": "bg-sky-500/10 text-sky-600 border-sky-200",
  "Quality Control Officer": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "Inventory Officer": "bg-violet-500/10 text-violet-600 border-violet-200",
  "Accountant": "bg-purple-500/10 text-purple-600 border-purple-200",
  "Customer": "bg-slate-500/10 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
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
