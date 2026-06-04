
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CommunicationLog } from '@/types/notification';
import { FormattedDate } from '@/components/shared/formatted-date';
import { Badge } from '@/components/ui/badge';
import { Eye, Fingerprint, Clock, MessageSquare, ShieldAlert, ArrowRightLeft, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationCardProps {
  notification: CommunicationLog;
  onPreview: (note: CommunicationLog) => void;
}

export function NotificationCard({ notification, onPreview }: NotificationCardProps) {
  const getPriorityColor = (p: string) => {
      if (p === 'Urgent') return 'bg-red-500';
      if (p === 'High') return 'bg-orange-500';
      return 'bg-primary';
  };

  return (
    <Card className="group relative overflow-hidden bg-card border-border/50 hover:border-primary/40 transition-all duration-300 rounded-[1.75rem] premium-shadow">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center border text-white transition-all duration-300",
              getPriorityColor(notification.priority)
            )}>
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate max-w-[140px]">
                {notification.subject}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[7px] h-4 bg-muted text-muted-foreground uppercase font-black">{notification.direction}</Badge>
                {notification.isInternalOnly && <Lock className="h-3 w-3 text-muted-foreground/30" />}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest border-primary/20 text-primary">{notification.channel}</Badge>
        </div>

        <div className="bg-muted/20 p-4 rounded-xl border border-dashed border-border/50 min-h-[64px]">
          <p className="text-[10px] font-medium text-muted-foreground italic leading-relaxed line-clamp-3">
            &quot;{notification.message}&quot;
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
              <Clock className="h-2.5 w-2.5" />
              <FormattedDate date={notification.createdAt} formatString="dd MMM, HH:mm" />
            </div>
            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest pl-4">Priority: {notification.priority}</p>
          </div>
          <Badge variant="outline" className={cn(
            "text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm bg-muted/30"
          )}>
            {notification.status}
          </Badge>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-10 text-[9px] font-black uppercase tracking-widest bg-background rounded-xl mt-2 group-hover:bg-primary group-hover:text-white transition-all"
          onClick={() => onPreview(notification)}
        >
          <Eye className="h-3 w-3 mr-2" /> Inspect Dossier
        </Button>
      </CardContent>
      
      {/* Visual Status Indicator */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
        notification.priority === 'Urgent' ? "bg-red-500" : "bg-primary/20"
      )} />
    </Card>
  );
}
