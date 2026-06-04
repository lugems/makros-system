'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, MessageSquare, Mail, Smartphone, Zap } from 'lucide-react';

interface NotificationSettingsProps {
  data: any;
  onUpdate: (field: string, value: boolean) => void;
}

export function NotificationSettings({ data, onUpdate }: NotificationSettingsProps) {
  const channels = [
    { id: 'sms', label: 'SMS Gateway', icon: MessageSquare },
    { id: 'email', label: 'Email Server', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp API', icon: Smartphone },
    { id: 'inApp', label: 'In-App Alerts', icon: Zap },
  ];

  const events = [
    { id: 'bookingReminders', label: 'Booking Confirmation & Reminders' },
    { id: 'jobStatusUpdates', label: 'Job Card Status Transitions' },
    { id: 'paymentReminders', label: 'Outstanding Balance Alerts' },
    { id: 'serviceReminders', label: 'Automated Service Cycle Reminders' },
    { id: 'lowStockAlerts', label: 'Inventory Depletion Warnings' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Transmission Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border/50">
                    <channel.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Label className="text-[10px] font-black uppercase tracking-widest">{channel.label}</Label>
                </div>
                <Switch 
                  checked={data?.[channel.id]} 
                  onCheckedChange={(val) => onUpdate(channel.id, val)} 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Logic Trigger Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-5 rounded-2xl border border-border/50 hover:bg-muted/10 transition-all">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{event.label}</Label>
                <Switch 
                  checked={data?.[event.id]} 
                  onCheckedChange={(val) => onUpdate(event.id, val)} 
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}