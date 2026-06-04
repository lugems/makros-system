'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { CommunicationLog } from '@/types/communication';
import { FormattedDate } from '@/components/shared/formatted-date';
import { 
    Fingerprint, 
    Clock, 
    MessageSquare, 
    Lock, 
    User, 
    Link as LinkIcon,
    CalendarClock,
    XCircle,
    CheckCircle2,
    Layers,
    History,
    Copy,
    ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CommunicationStatusBadge } from './communication-status-badge';
import { CommunicationPriorityBadge } from './communication-priority-badge';
import { CommunicationChannelBadge } from './communication-channel-badge';
import { cn } from '@/lib/utils';
import { resolveCommunicationLog, closeCommunicationLog, updateCommunicationLog } from '@/services/communications-service';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface CommunicationDetailsProps {
  log: CommunicationLog | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunicationDetails({ log, isOpen, onOpenChange }: CommunicationDetailsProps) {
  const { user, role: currentRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  if (!log) return null;

  const handleUpdateStatus = async (status: string) => {
    if (!user) return;
    if (status === 'Resolved') resolveCommunicationLog(log.logId, user.userId);
    else if (status === 'Closed') closeCommunicationLog(log.logId, user.userId);
    else updateCommunicationLog(log.logId, { status: status as any }, user.userId);
    toast({ title: "Registry Updated", description: `Interaction trace marked as ${status}.` });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(log.logId);
    toast({ title: "Reference Copied", description: "Dossier ID committed to clipboard." });
  };

  const canResolve = ['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Accountant'].includes(currentRole || '');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] rounded-[2rem] border-border/50 bg-background text-foreground shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-muted/30 border-b">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Fingerprint className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground">ID: {log.logId.toUpperCase().slice(-12)}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCopyId} className="h-6 w-6 rounded-md hover:bg-background">
                        <Copy className="h-3 w-3 opacity-40" />
                    </Button>
                </div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-tight">{log.subject}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
            <div className="p-8 space-y-8">
                <div className="flex flex-wrap gap-3">
                    <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-4 h-6">{log.direction}</Badge>
                    <Badge className="bg-indigo-500/10 text-indigo-600 border-none text-[8px] font-black uppercase px-4 h-6">
                        <Layers className="h-2.5 w-2.5 mr-1.5" /> {log.module}
                    </Badge>
                    <CommunicationChannelBadge channel={log.channel} className="h-6 px-4" />
                    <CommunicationPriorityBadge priority={log.priority} className="h-6 px-4" />
                    {log.isInternalOnly && (
                        <Badge className="bg-slate-900 text-white border-none text-[8px] font-black uppercase px-4 h-6">
                            <Lock className="h-2.5 w-2.5 mr-1.5" /> INTERNAL_ONLY
                        </Badge>
                    )}
                </div>

                <div className="bg-muted/10 border border-border/50 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
                    <p className="text-base font-medium leading-relaxed italic text-foreground/90 relative z-10">
                        &quot;{log.message}&quot;
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Initiator</h4>
                        </div>
                        <div className="pl-6 space-y-1">
                            <p className="text-sm font-black uppercase">{log.fromName || 'SYSTEM'}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{log.fromRole}</p>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Temporal Trace</h4>
                        </div>
                        <div className="pl-6 space-y-1">
                            <p className="text-sm font-black uppercase"><FormattedDate date={log.createdAt} formatString="dd MMM yyyy" /></p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest"><FormattedDate date={log.createdAt} formatString="HH:mm 'UTC'" /></p>
                        </div>
                    </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <LinkIcon className="h-3.5 w-3.5" />
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Dossier Context</h4>
                    </div>
                    <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {log.customerId && (
                            <button onClick={() => router.push(`/customers/${log.customerId}`)} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-primary/[0.03] hover:border-primary/30 transition-all group">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase">Account Holder</p>
                                    <p className="text-[10px] font-bold uppercase truncate max-w-[120px]">{log.toName || 'View Dossier'}</p>
                                </div>
                                <ExternalLink className="h-3 w-3 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
                            </button>
                        )}
                        {log.jobCardId && (
                            <button onClick={() => router.push(`/job-cards/${log.jobCardId}`)} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-primary/[0.03] hover:border-primary/30 transition-all group">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase">Job Card Registry</p>
                                    <p className="text-[10px] font-mono font-bold uppercase">#{log.jobCardId.toUpperCase().slice(-8)}</p>
                                </div>
                                <ExternalLink className="h-3 w-3 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
                            </button>
                        )}
                        {log.invoiceId && (
                            <button onClick={() => router.push(`/invoices/${log.invoiceId}`)} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-primary/[0.03] hover:border-primary/30 transition-all group">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase">Billing Record</p>
                                    <p className="text-[10px] font-mono font-bold uppercase">#{log.invoiceId.toUpperCase().slice(-8)}</p>
                                </div>
                                <ExternalLink className="h-3 w-3 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
                            </button>
                        )}
                    </div>
                </div>

                {log.requiresFollowUp && (
                    <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm transition-all group-hover:scale-110">
                                <CalendarClock className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black uppercase text-amber-700 tracking-[0.1em]">Follow-Up Protocol Active</p>
                                <p className="text-xs font-bold text-foreground">Target Date: {log.followUpDate || 'TBD'}</p>
                            </div>
                        </div>
                        <Badge className="bg-amber-500 text-white border-none text-[8px] font-black uppercase">PENDING_ACTION</Badge>
                    </div>
                )}
            </div>
        </DialogBody>

        <DialogFooter className="p-8 bg-muted/30 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
                {canResolve && log.status !== 'Pending Response' && (
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateStatus('Pending Response')}
                        className="h-10 px-5 rounded-xl font-black uppercase text-[9px] tracking-widest bg-background border-amber-200 text-amber-600 hover:bg-amber-50"
                    >
                        <History className="h-3.5 w-3.5 mr-2" /> Mark Pending
                    </Button>
                )}
                {canResolve && log.status !== 'Resolved' && (
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateStatus('Resolved')}
                        className="h-10 px-5 rounded-xl font-black uppercase text-[9px] tracking-widest bg-background border-green-200 text-green-600 hover:bg-green-50"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Mark Resolved
                    </Button>
                )}
                {canResolve && log.status !== 'Closed' && (
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateStatus('Closed')}
                        className="h-10 px-5 rounded-xl font-black uppercase text-[9px] tracking-widest bg-background border-slate-200 text-slate-500 hover:bg-slate-50"
                    >
                        <XCircle className="h-3.5 w-3.5 mr-2" /> Archive
                    </Button>
                )}
            </div>
            <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Internal Registry Analysis active</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
