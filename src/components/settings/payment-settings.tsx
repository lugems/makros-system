'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, Smartphone, Landmark, BadgePercent } from 'lucide-react';

interface PaymentSettingsProps {
  data: any;
  onUpdate: (field: string, value: boolean) => void;
}

export function PaymentSettings({ data, onUpdate }: PaymentSettingsProps) {
  const methods = [
    { id: 'cash', label: 'Physical Treasury (Cash)', icon: Wallet, note: 'Manual verification required' },
    { id: 'mobileMoney', label: 'Digital Wallet (Mobile Money)', icon: Smartphone, note: 'MTN/Airtel Integration placeholder' },
    { id: 'bankTransfer', label: 'Bank SWIFT/EFT', icon: Landmark, note: 'Manual reference verification' },
    { id: 'card', label: 'Credit/Debit Gateway', icon: CreditCard, note: 'Stripe/Pesapal Integration placeholder' },
    { id: 'credit', label: 'Line of Credit', icon: BadgePercent, note: 'Allows deferred settlement' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b p-8">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Authorized Settlement Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-5 rounded-2xl border border-border/50 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center">
                  <method.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest">{method.label}</Label>
                  <p className="text-[9px] font-bold text-primary/60 uppercase tracking-tighter italic">{method.note}</p>
                </div>
              </div>
              <Switch 
                checked={data?.[method.id]} 
                onCheckedChange={(val) => onUpdate(method.id, val)} 
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}