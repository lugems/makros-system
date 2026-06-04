'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Package, ShieldAlert, UserCheck } from 'lucide-react';

interface InventoryAlertSettingsProps {
  data: any;
  onUpdate: (field: string, value: boolean) => void;
}

export function InventoryAlertSettings({ data, onUpdate }: InventoryAlertSettingsProps) {
  const alerts = [
    { id: 'lowStockEnabled', label: 'Global Depletion Monitoring', description: 'Enable real-time threshold checking for all SKUs', icon: Package },
    { id: 'notifyInventoryOfficer', label: 'Logistics Officer Routing', description: 'Route SKU depletion alerts to the Inventory Officer', icon: UserCheck },
    { id: 'notifyWorkshopManager', label: 'Executive Management Routing', description: 'Escalate critical shortages to the Workshop Manager', icon: ShieldAlert },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="max-w-3xl">
        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Logistic Safety Protocols
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="flex items-center justify-between p-6 rounded-[1.5rem] bg-muted/20 border border-transparent hover:border-primary/10 transition-all gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border/50 shrink-0">
                    <alert.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest">{alert.label}</Label>
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase opacity-60">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={data?.[alert.id]} 
                  onCheckedChange={(val) => onUpdate(alert.id, val)} 
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}