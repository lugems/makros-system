
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { CommunicationLog } from '@/types/notification';
import { FormattedDate } from '@/components/shared/formatted-date';
import { 
    Fingerprint, 
    Clock, 
    Activity, 
    ShieldCheck, 
    MessageSquare, 
    Lock, 
    ArrowRightLeft, 
    AlertTriangle,
    User,
    Link as LinkIcon,
    CalendarClock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface NotificationPreviewDialogProps {
  note: CommunicationLog | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPreviewDialog({ note, isOpen, onOpenChange }: NotificationPreviewDialogProps) {
  if (!note) return null;

  const getPriorityColor = (p: string) => {
    if (p === 'Urgent') return 'text-red-500';
    if (p === 'High') return 'text-orange-500';
    return 'text-primary';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-[2rem] border-border/50 bg-background text-foreground shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-muted/30 border-b">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Fingerprint className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground">ID: {note.logId.toUpperCase().slice(-12)}</span>
                </div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">{note.subject}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
            <div className="p-8 space-y-8">
                {/* Meta Attributes */}
                <div className="flex flex-wrap gap-3">
                    <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-4 h-6">{note.direction}</Badge>
                    <Badge className="bg-muted text-muted-foreground border-none text-[8px] font-black uppercase px-4 h-6">{note.channel}</Badge>
                    <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-4 h-6", getPriorityColor(note.priority))}>
                        <AlertTriangle className="h-2.5 w-2.5 mr-1.5" /> {note.priority} PRIORITY
                    </Badge>
                    {note.isInternalOnly && (
                        <Badge className="bg-slate-900 text-white border-none text-[8px] font-black uppercase px-4 h-6">
                            <Lock className="h-2.5 w-2.5 mr-1.5" /> INTERNAL_OS
                        </Badge>
                    )}
                </div>

                <div className="bg-muted/10 border border-border/50 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
                    <p className="text-base font-medium leading-relaxed italic text-foreground/90 relative z-10">
                        &quot;{note.message}&quot;
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Initiator</h4>
                        </div>
                        <div className="pl-6 space-y-1">
                            <p className="text-sm font-black uppercase">{note.fromName || 'SYSTEM'}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{note.fromRole}</p>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Temporal Trace</h4>
                        </div>
                        <div className="pl-6 space-y-1">
                            <p className="text-sm font-black uppercase"><FormattedDate date={note.createdAt} formatString="dd MMM yyyy" /></p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest"><FormattedDate date={note.createdAt} formatString="HH:mm 'UTC'" /></p>
                        </div>
                    </div>
                </div>

                <Separator className="opacity-50" />

                {/* Technical Links */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <LinkIcon className="h-3.5 w-3.5" />
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Linked Dossiers</h4>
                    </div>
                    <div className="pl-6 grid grid-cols-2 gap-4">
                        {note.jobCardId && (
                            <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Job Card</p>
                                <p className="text-[10px] font-mono font-bold uppercase">{note.jobCardId}</p>
                            </div>
                        )}
                        {note.invoiceId && (
                            <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Invoice</p>
                                <p className="text-[10px] font-mono font-bold uppercase">{note.invoiceId}</p>
                            </div>
                        )}
                    </div>
                </div>

                {note.requiresFollowUp && (
                    <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm">
                                <CalendarClock className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black uppercase text-amber-700 tracking-[0.1em]">Follow-Up protocol active</p>
                                <p className="text-xs font-bold text-foreground">Target Date: {note.followUpDate || 'TBD'}</p>
                            </div>
                        </div>
                        <Badge className="bg-amber-500 text-white border-none text-[8px] font-black uppercase">PENDING_SYNC</Badge>
                    </div>
                )}
            </div>
        </DialogBody>

        <DialogFooter className="p-8 bg-muted/30 border-t flex justify-center">
            <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.6em]">Makros System Technical Interaction Trace Active</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
