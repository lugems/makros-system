'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AuditLog } from '@/types/audit-log';
import { StaffMember } from '@/types/staff';
import { AuditActionBadge } from './audit-action-badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Fingerprint, Clock, User, Layers, FileSearch } from 'lucide-react';
import { FormattedDate } from '@/components/shared/formatted-date';
import { cn } from '@/lib/utils';

interface AuditLogTableProps {
  logs: AuditLog[];
  users: StaffMember[];
  onViewDetails: (log: AuditLog) => void;
}

/**
 * @fileOverview Technical registry table for system-wide auditing with high-density layout.
 */
export function AuditLogTable({ logs, users, onViewDetails }: AuditLogTableProps) {
    const getUserName = (userId: string) => {
        const user = users.find(u => u.userId === userId);
        return user ? user.fullName : 'System Process';
    };

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground">
            <TableHead className="px-6 py-4">Temporal Sync</TableHead>
            <TableHead className="px-6 py-4">Module & Record</TableHead>
            <TableHead className="px-6 py-4">Operational Action</TableHead>
            <TableHead className="px-6 py-4">Personnel Reference</TableHead>
            <TableHead className="px-6 py-4">Event Summary</TableHead>
            <TableHead className="px-6 py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const id = (log as any).id || log.logId;
            return (
              <TableRow 
                  key={id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary/40"
                  onClick={() => onViewDetails(log)}
              >
                <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Clock className="h-4 w-4 text-primary opacity-50" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs font-black uppercase">
                              <FormattedDate date={log.createdAt} formatString="dd MMM yyyy" />
                            </p>
                            <p className="text-[9px] font-mono text-muted-foreground font-bold tracking-tighter">
                                <FormattedDate date={log.createdAt} formatString="HH:mm:ss 'UTC'" />
                            </p>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-foreground/80 flex items-center gap-1.5">
                            <Layers className="h-3 w-3 opacity-40" />
                            {log.module}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Fingerprint className="h-3 w-3 text-muted-foreground/40" />
                            <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-tighter">
                                REF: {log.recordId?.toUpperCase().slice(-8) || 'N/A'}
                            </span>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4"><AuditActionBadge action={log.action} /></TableCell>
                <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/5 flex items-center justify-center">
                            <User className="h-3 w-3 text-primary opacity-50" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-tight">{getUserName(log.userId)}</span>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4 max-w-[280px]">
                    <p className="text-[11px] font-medium text-muted-foreground line-clamp-1 italic leading-relaxed">
                        &quot;{log.description}&quot;
                    </p>
                </TableCell>
                <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-48">
                            <DropdownMenuItem onClick={() => onViewDetails(log)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                <FileSearch className="h-3.5 w-3.5" />
                                View Dossier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => log.recordId && navigator.clipboard.writeText(log.recordId)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                <Fingerprint className="h-3.5 w-3.5" />
                                Copy Reference
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
