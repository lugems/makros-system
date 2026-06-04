import { Badge, BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AuditActionBadgeProps {
  action: string;
  className?: string;
}

/**
 * @fileOverview A stylized badge for audit actions with refined technical colors.
 */
export function AuditActionBadge({ action, className }: AuditActionBadgeProps) {
  const getBadgeStyles = () => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('REGISTER') || act.includes('ADD')) {
      return "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/50";
    }
    if (act.includes('UPDATE') || act.includes('ASSIGN') || act.includes('EDIT')) {
      return "bg-primary/10 text-primary border-primary/20 dark:border-primary/30";
    }
    if (act.includes('DELETE') || act.includes('DEACTIVATE') || act.includes('REMOVE')) {
      return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50";
    }
    if (act.includes('LOGIN') || act.includes('LOGOUT')) {
      return "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-900/50";
    }
    return "bg-muted text-muted-foreground border-border/50";
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm", 
        getBadgeStyles(),
        className
      )}
    >
      {action}
    </Badge>
  );
}
