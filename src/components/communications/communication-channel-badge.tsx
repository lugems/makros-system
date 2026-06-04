'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CommunicationChannel } from '@/types/communication';
import { cn } from '@/lib/utils';
import { MessageSquare, Mail, Phone, Bell, Smartphone, User, FileText } from 'lucide-react';

interface CommunicationChannelBadgeProps {
  channel: CommunicationChannel;
  className?: string;
}

const channelConfigs: Record<CommunicationChannel, { icon: any; label: string }> = {
  "In-App": { icon: Bell, label: "INTERNAL_OS" },
  "Phone Call": { icon: Phone, label: "VOICE_TRANS" },
  "SMS": { icon: Smartphone, label: "SMS_MOBILE" },
  "WhatsApp": { icon: MessageSquare, label: "WA_SYNC" },
  "Email": { icon: Mail, label: "SMTP_MAIL" },
  "Walk-In": { icon: User, label: "PHYSICAL_INT" },
  "Internal Note": { icon: FileText, label: "STAFF_ONLY" },
};

export function CommunicationChannelBadge({ channel, className }: CommunicationChannelBadgeProps) {
  const config = channelConfigs[channel] || { icon: MessageSquare, label: "UNKNOWN" };
  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "flex items-center gap-1.5 bg-muted/50 text-muted-foreground border-none text-[8px] font-black uppercase tracking-widest px-2 h-5",
        className
      )}
    >
      <Icon className="h-2.5 w-2.5 opacity-60" />
      {config.label}
    </Badge>
  );
}
