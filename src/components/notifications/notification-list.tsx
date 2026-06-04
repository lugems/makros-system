
'use client';

import * as React from 'react';
import { CommunicationLog } from '@/types/notification';
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
import { Eye, History, Activity, Inbox, Tag, ArrowRightLeft, ShieldAlert, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  notifications: CommunicationLog[];
  onPreview: (note: CommunicationLog) => void;
}

export function NotificationList({ notifications, onPreview }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-32 text-center border-2 border-dashed rounded-[2.5rem] bg-muted/5 opacity-30 flex flex-col items-center">
        <Inbox className="h-12 w-12 mb-4" />
        <p className="text-sm font-medium italic">No interaction traces detected in the active registry.</p>
      </div>
    );
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
        case 'Urgent': return "bg-red-500 text-white border-none";
        case 'High': return "bg-orange-500/10 text-orange-600 border-orange-200";
        case 'Low': return "bg-slate-100 text-slate-500 border-slate-200";
        default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getDirectionStyle = (dir: string) => {
      switch (dir) {
          case 'Incoming': return "bg-green-500/10 text-green-600 border-green-200";
          case 'Outgoing': return "bg-blue-500/10 text-blue-600 border-blue-200";
          default: return "bg-purple-500/10 text-purple-600 border-purple-200";
      }
  };

  return (
    <div className="rounded-3xl border bg-card overflow-hidden shadow-sm premium-shadow">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground border-none">
            <TableHead className="px-6 py-5">Personnel Source</TableHead>
            <TableHead className="px-6 py-5">Subject & Status</TableHead>
            <TableHead className="px-6 py-5">Protocol</TableHead>
            <TableHead className="px-6 py-5">Priority</TableHead>
            <TableHead className="px-6 py-5">Follow-Up</TableHead>
            <TableHead className="px-6 py-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((note) => (
              <TableRow 
                  key={note.logId} 
                  className="hover:bg-muted/30 transition-colors group cursor-pointer border-border/40"
                  onClick={() => onPreview(note)}
              >
                <TableCell className="px-6 py-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                                {note.fromName?.[0] || 'S'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                            <p className="text-xs font-black uppercase tracking-tight leading-none truncate max-w-[120px]">{note.fromName || 'SYSTEM'}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{note.fromRole}</p>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-6 max-w-[280px]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                            {note.subject}
                        </span>
                        {note.isInternalOnly && <Lock className="h-3 w-3 text-muted-foreground/40" title="Internal Only" />}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[7px] font-black uppercase tracking-widest h-4", getDirectionStyle(note.direction))}>
                            {note.direction}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tighter">
                            <FormattedDate date={note.createdAt} formatString="dd MMM, HH:mm" />
                        </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[8px] font-black uppercase tracking-widest h-5 px-2 border-none">
                        {note.channel}
                    </Badge>
                </TableCell>
                <TableCell className="px-6 py-6">
                  <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm",
                      getPriorityStyle(note.priority)
                  )}>
                    {note.priority}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-6">
                    {note.requiresFollowUp ? (
                        <div className="flex flex-col gap-1">
                            <Badge className="bg-amber-500/10 text-amber-600 border-none text-[8px] font-black uppercase w-fit h-4">Active</Badge>
                            {note.followUpDate && (
                                <p className="text-[8px] font-mono font-bold text-muted-foreground">{note.followUpDate}</p>
                            )}
                        </div>
                    ) : (
                        <span className="text-[10px] text-muted-foreground opacity-20 uppercase font-bold tracking-widest">None</span>
                    )}
                </TableCell>
                <TableCell className="px-6 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => onPreview(note)} className="h-9 w-9 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
