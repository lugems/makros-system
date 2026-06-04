import { AuditLog } from '@/types/audit-log';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AuditActionBadge } from './audit-action-badge';
import { FormattedDate } from '@/components/shared/formatted-date';
import { User, Layers, Fingerprint } from 'lucide-react';

interface AuditLogCardProps {
  log: AuditLog;
}

/**
 * @fileOverview Mobile-optimized audit log card with high-density technical specs.
 */
export function AuditLogCard({ log }: AuditLogCardProps) {
  return (
    <Card className="hover:border-primary/40 transition-all duration-300 group">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary opacity-50" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{log.module}</span>
        </div>
        <AuditActionBadge action={log.action} />
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">{log.description}</p>
        
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
            <div className="space-y-1">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <User className="h-2.5 w-2.5" /> Identity
                </p>
                <p className="text-[10px] font-bold truncate">{log.user?.fullName || 'System Process'}</p>
            </div>
            <div className="space-y-1 text-right">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Temporal Ref</p>
                <p className="text-[10px] font-bold text-foreground">
                    <FormattedDate date={log.createdAt} formatString="dd MMM, HH:mm" />
                </p>
            </div>
        </div>

        <div className="bg-muted/30 p-2 rounded-lg border border-dashed border-border/50 flex items-center gap-2">
            <Fingerprint className="h-3 w-3 text-muted-foreground/40" />
            <p className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-tighter truncate">
                REF: {log.recordId}
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
