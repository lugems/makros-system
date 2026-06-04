'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CommunicationLog } from '@/types/communication';
import { FormattedDate } from '@/components/shared/formatted-date';
import { Badge } from '@/components/ui/badge';
import { 
    Eye, 
    MessageSquare, 
    Lock, 
    Edit, 
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Copy,
    User,
    Wrench,
    History,
    BellPlus,
    Clock
} from 'lucide-react';
import { CommunicationStatusBadge } from './communication-status-badge';
import { cn } from '@/lib/utils';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { resolveCommunicationLog, closeCommunicationLog, updateCommunicationLog } from '@/services/communications-service';

interface CommunicationCardProps {
  log: CommunicationLog;
  onPreview: (log: CommunicationLog) => void;
  onEdit: (log: CommunicationLog) => void;
}

export function CommunicationCard({ log, onPreview, onEdit }: CommunicationCardProps) {
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

  return (
    <Card className="group relative overflow-hidden bg-card border-border/50 hover:border-primary/40 transition-all duration-300 rounded-[1.75rem] premium-shadow h-full flex flex-col">
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-sm",
              log.priority === 'Urgent' ? "bg-red-500 text-white shadow-red-500/20" : "bg-primary/10 text-primary border-primary/20"
            )}>
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate max-w-[140px]">
                {log.subject}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[7px] h-4 bg-muted text-muted-foreground uppercase font-black">{log.direction}</Badge>
                {log.isInternalOnly && <Lock className="h-3 w-3 text-muted-foreground/30" />}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-1.5 w-64 shadow-2xl">
                  <DropdownMenuLabel className="text-[9px] font-black uppercase text-muted-foreground px-3 py-2">Lifecycle Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleStatusShift(log.logId, 'Pending Response')} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                      <History className="h-4 w-4 text-amber-500" /> Pending Response
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusShift(log.logId, 'Resolved')} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> Mark Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusShift(log.logId, 'Closed')} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                      <XCircle className="h-4 w-4 text-slate-400" /> Close Archive
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="opacity-50" />
                  
                  <DropdownMenuLabel className="text-[9px] font-black uppercase text-muted-foreground px-3 py-2">Dossier Context</DropdownMenuLabel>
                  {log.customerId && <DropdownMenuItem onClick={() => router.push(`/customers/${log.customerId}`)} className="rounded-lg gap-3 text-[10px] font-black uppercase"><User className="h-4 w-4 text-indigo-500" /> View Customer</DropdownMenuItem>}
                  {log.jobCardId && <DropdownMenuItem onClick={() => router.push(`/job-cards/${log.jobCardId}`)} className="rounded-lg gap-3 text-[10px] font-black uppercase"><Wrench className="h-4 w-4 text-indigo-500" /> View Job Card</DropdownMenuItem>}
                  
                  <DropdownMenuSeparator className="opacity-50" />
                  
                  <DropdownMenuItem onClick={() => onEdit(log)} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                      <Edit className="h-4 w-4 text-primary" /> Synchronize
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit({...log, requiresFollowUp: true})} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary">
                      <BellPlus className="h-4 w-4" /> Create Follow-Up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyId(log.logId)} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                      <Copy className="h-4 w-4" /> Copy Reference
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="bg-muted/20 p-4 rounded-xl border border-dashed border-border/50 flex-1">
          <p className="text-[10px] font-medium text-muted-foreground italic leading-relaxed line-clamp-3">
            &quot;{log.message}&quot;
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
              <Clock className="h-2.5 w-2.5" />
              <FormattedDate date={log.createdAt} formatString="dd MMM, HH:mm" />
            </div>
            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest pl-4">Flow: {log.direction}</p>
          </div>
          <CommunicationStatusBadge status={log.status} className="text-[7px]" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="h-10 text-[9px] font-black uppercase tracking-widest bg-background rounded-xl border-border/50 hover:bg-muted"
                onClick={() => onEdit(log)}
            >
                <Edit className="h-3.5 w-3.5 mr-2" /> Update
            </Button>
            <Button 
                variant="outline" 
                size="sm" 
                className="h-10 text-[9px] font-black uppercase tracking-widest bg-background rounded-xl group-hover:bg-primary group-hover:text-white transition-all border-border/50"
                onClick={() => onPreview(log)}
            >
                <Eye className="h-3.5 w-3.5 mr-2" /> Inspect
            </Button>
        </div>
      </CardContent>
      
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
        log.priority === 'Urgent' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-primary/20"
      )} />
    </Card>
  );
}
