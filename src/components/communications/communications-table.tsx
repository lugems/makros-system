'use client';

import React from 'react';
import { CommunicationLog } from '@/types/communication';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FormattedDate } from '@/components/shared/formatted-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    Eye, 
    Lock, 
    Clock, 
    Edit, 
    Layers, 
    MoreHorizontal, 
    CheckCircle2, 
    XCircle, 
    History, 
    Copy, 
    User, 
    Calendar, 
    Wrench, 
    Receipt,
    BellPlus
} from 'lucide-react';
import { CommunicationStatusBadge } from './communication-status-badge';
import { CommunicationChannelBadge } from './communication-channel-badge';
import { CommunicationPriorityBadge } from './communication-priority-badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { resolveCommunicationLog, closeCommunicationLog, updateCommunicationLog } from '@/services/communications-service';

interface CommunicationsTableProps {
  logs: CommunicationLog[];
  onPreview: (log: CommunicationLog) => void;
  onEdit: (log: CommunicationLog) => void;
}

export function CommunicationsTable({ logs, onPreview, onEdit }: CommunicationsTableProps) {
  const { role: currentRole, user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "Reference Copied", description: "Log ID committed to clipboard." });
  };

  const handleStatusShift = async (logId: string, status: string) => {
      if (!currentUser) return;
      if (status === 'Resolved') resolveCommunicationLog(logId, currentUser.userId);
      else if (status === 'Closed') closeCommunicationLog(logId, currentUser.userId);
      else updateCommunicationLog(logId, { status: status as any }, currentUser.userId);
      toast({ title: "Status Synchronized", description: `Interaction marked as ${status}.` });
  };

  const isStaff = ['Makros System Owner', 'Workshop Manager', 'Receptionist'].includes(currentRole || '');

  return (
    <div className="rounded-3xl border bg-card overflow-hidden shadow-sm premium-shadow">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground border-none">
            <TableHead className="px-6 py-5">Personnel Source</TableHead>
            <TableHead className="px-6 py-5">Interaction Trace</TableHead>
            <TableHead className="px-6 py-5">Module</TableHead>
            <TableHead className="px-6 py-5">Protocol</TableHead>
            <TableHead className="px-6 py-5">Priority</TableHead>
            <TableHead className="px-6 py-5">Registry State</TableHead>
            <TableHead className="px-6 py-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow 
              key={log.logId} 
              className="hover:bg-muted/30 transition-colors group cursor-pointer border-border/40"
              onClick={() => onPreview(log)}
            >
              <TableCell className="px-6 py-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm shrink-0">
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                      {log.fromName?.[0] || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-black uppercase tracking-tight leading-none truncate max-w-[140px]">{log.fromName || 'SYSTEM'}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate">{log.fromRole}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-6 py-6 max-w-[300px]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                      {log.subject}
                    </span>
                    {log.isInternalOnly && <Lock className="h-3 w-3 text-muted-foreground/40" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                        "text-[7px] font-black uppercase tracking-widest h-4",
                        log.direction === 'Incoming' ? "bg-green-500/10 text-green-600 border-green-200" :
                        log.direction === 'Outgoing' ? "bg-blue-500/10 text-blue-600 border-blue-200" :
                        "bg-purple-500/10 text-purple-600 border-purple-200"
                    )}>
                      {log.direction}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tighter flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      <FormattedDate date={log.createdAt} formatString="dd MMM, HH:mm" />
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-6 py-6">
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase text-muted-foreground">
                      <Layers className="h-3 w-3 opacity-40" />
                      {log.module}
                  </div>
              </TableCell>
              <TableCell className="px-6 py-6">
                <CommunicationChannelBadge channel={log.channel} />
              </TableCell>
              <TableCell className="px-6 py-6">
                <CommunicationPriorityBadge priority={log.priority} />
              </TableCell>
              <TableCell className="px-6 py-6">
                <CommunicationStatusBadge status={log.status} />
              </TableCell>
              <TableCell className="px-6 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl p-2 w-64 shadow-2xl border-border/50">
                        <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Dossier Command</DropdownMenuLabel>
                        
                        <DropdownMenuItem onClick={() => onPreview(log)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                            <Eye className="h-4 w-4 text-primary" /> Inspect Trace
                        </DropdownMenuItem>
                        
                        {isStaff && (
                            <DropdownMenuItem onClick={() => onEdit(log)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                                <Edit className="h-4 w-4 text-primary" /> Synchronize Record
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="opacity-50" />
                        
                        <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Workflow State</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleStatusShift(log.logId, 'Pending Response')} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                            <History className="h-4 w-4 text-amber-500" /> Mark Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusShift(log.logId, 'Resolved')} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="h-4 w-4 text-green-500" /> Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusShift(log.logId, 'Closed')} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                            <XCircle className="h-4 w-4 text-slate-400" /> Close Trace
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="opacity-50" />
                        
                        <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Registry Linkage</DropdownMenuLabel>
                        {log.customerId && (
                            <DropdownMenuItem onClick={() => router.push(`/customers/${log.customerId}`)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                                <User className="h-4 w-4 text-indigo-500" /> View Customer
                            </DropdownMenuItem>
                        )}
                        {log.jobCardId && (
                            <DropdownMenuItem onClick={() => router.push(`/job-cards/${log.jobCardId}`)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                                <Wrench className="h-4 w-4 text-indigo-500" /> View Job Card
                            </DropdownMenuItem>
                        )}
                        {log.invoiceId && (
                            <DropdownMenuItem onClick={() => router.push(`/invoices/${log.invoiceId}`)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                                <Receipt className="h-4 w-4 text-indigo-500" /> View Invoice
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="opacity-50" />

                        <DropdownMenuItem onClick={() => onEdit({...log, requiresFollowUp: true})} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary">
                            <BellPlus className="h-4 w-4" /> Create Follow-Up
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyId(log.logId)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                            <Copy className="h-4 w-4" /> Copy Log ID
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
