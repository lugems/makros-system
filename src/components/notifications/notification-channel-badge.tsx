'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Phone, Bell, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommunicationChannel } from '@/types/notification';

interface NotificationChannelBadgeProps {
  channel: CommunicationChannel;
  className?: string;
}

export function NotificationChannelBadge({ channel, className }: NotificationChannelBadgeProps) {
  const getChannelConfig = () => {
    switch (channel) {
      case 'SMS':
        return {
          icon: <Smartphone className="h-3 w-3" />,
          style: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50",
          label: "SMS_MOBILE"
        };
      case 'Email':
        return {
          icon: <Mail className="h-3 w-3" />,
          style: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-900/50",
          label: "SMTP_MAIL"
        };
      case 'WhatsApp':
        return {
          icon: <Phone className="h-3 w-3" />,
          style: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/50",
          label: "WABA_SYNC"
        };
      case 'In-App':
        return {
          icon: <Bell className="h-3 w-3" />,
          style: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/50",
          label: "INTERNAL_OS"
        };
      default:
        return {
          icon: <MessageSquare className="h-3 w-3" />,
          style: "bg-muted text-muted-foreground",
          label: "UNKNOWN"
        };
    }
  };

  const config = getChannelConfig();

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded shadow-sm", 
        config.style,
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
