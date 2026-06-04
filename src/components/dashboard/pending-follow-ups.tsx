'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, BellPlus, ChevronRight, Fingerprint, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommunicationLog } from '@/types/communication';
import { FormattedDate } from '@/components/shared/formatted-date';

interface PendingFollowUpsProps {
  logs: CommunicationLog[];
}

/**
 * @fileOverview Technical widget for monitoring urgent interaction follow-ups on the dashboard.
 */
export const PendingFollowUps: React.FC<PendingFollowUpsProps> = ({ logs }) => {
  const router = useRouter();

  return (
    <div className="divide-y divide-border/40">
      {logs.length > 0 ? logs.map((log) => {
        const isUrgent = log.priority === 'Urgent';
        
        return (
          <div 
            key={log.logId} 
            className="flex items-center justify-between p-5 hover:bg-muted/10 transition-colors group cursor-pointer"
            onClick={() => router.push('/communications')}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 shadow-sm",
                isUrgent ? "bg-red-500/10 text-red-600 border-red-200" : "bg-primary/5 border-primary/10 text-primary"
              )}>
                <BellPlus className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate max-w-[140px]">{log.subject}</p>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted border border-border/50">
                    <Fingerprint className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase">{log.logId.slice(-4)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarClock className="h-2.5 w-2.5 opacity-50 text-orange-500" />
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                    Target: {log.followUpDate || 'Asap'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
          </div>
        );
      }) : (
        <div className="p-10 text-center opacity-30">
          <MessageSquare className="h-8 w-8 mx-auto mb-2" />
          <p className="text-[9px] font-black uppercase tracking-widest">Interaction Buffer Clear</p>
        </div>
      )}
      <div className="p-4 bg-muted/5 text-center">
        <button 
            onClick={() => router.push('/communications')}
            className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
        >
          Open Interaction Registry
        </button>
      </div>
    </div>
  );
};
