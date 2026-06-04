'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { WorkshopSettings } from '@/types/settings';
import { Monitor, Globe, Coins, Timer, Database, Download, RotateCcw } from 'lucide-react';

interface SystemPreferencesProps {
  data: Partial<WorkshopSettings> | null;
  onUpdate: (field: keyof WorkshopSettings, value: any) => void;
}

export function SystemPreferences({ data, onUpdate }: SystemPreferencesProps) {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Localization Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Coins className="h-3 w-3" /> Ledger Currency
              </Label>
              <Select value={data?.currency} onValueChange={(val) => onUpdate('currency', val)}>
                <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="UGX" className="font-bold">UGX - Ugandan Shilling</SelectItem>
                  <SelectItem value="KES" className="font-bold">KES - Kenyan Shilling</SelectItem>
                  <SelectItem value="USD" className="font-bold">USD - US Dollar</SelectItem>
                  <SelectItem value="TZS" className="font-bold">TZS - Tanzanian Shilling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Timer className="h-3 w-3" /> Temporal Reference (Timezone)
              </Label>
              <Select value={data?.timezone} onValueChange={(val) => onUpdate('timezone', val)}>
                <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold">
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="Africa/Kampala" className="font-bold">Africa/Kampala (EAT)</SelectItem>
                  <SelectItem value="Africa/Nairobi" className="font-bold">Africa/Nairobi (EAT)</SelectItem>
                  <SelectItem value="UTC" className="font-bold">Universal Coordinated Time (UTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                Language Protocol
              </Label>
              <Select value={data?.language} onValueChange={(val) => onUpdate('language', val)}>
                <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="English" className="font-bold">English (International)</SelectItem>
                  <SelectItem value="Swahili" className="font-bold">Swahili (Regional)</SelectItem>
                  <SelectItem value="Luganda" className="font-bold">Luganda (Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Data Sovereignty
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mb-2">
              <p className="text-[10px] font-medium text-muted-foreground leading-relaxed uppercase opacity-70">
                Execute emergency data exports or restore technical parameters from a certified registry snapshot.
              </p>
            </div>
            
            <Button variant="outline" className="w-full h-14 justify-start gap-4 rounded-2xl border-border/50 hover:bg-muted font-black uppercase tracking-widest text-[10px]">
              <div className="h-8 w-8 rounded-lg bg-background border border-border/50 flex items-center justify-center">
                <Download className="h-3.5 w-3.5 text-primary" />
              </div>
              Export Global Registry Snapshot
            </Button>

            <Button variant="outline" className="w-full h-14 justify-start gap-4 rounded-2xl border-border/50 hover:bg-muted font-black uppercase tracking-widest text-[10px]">
              <div className="h-8 w-8 rounded-lg bg-background border border-border/50 flex items-center justify-center">
                <Database className="h-3.5 w-3.5 text-orange-500" />
              </div>
              Trigger Full System Backup
            </Button>

            <Button variant="ghost" className="w-full h-14 justify-start gap-4 rounded-2xl hover:bg-red-500/5 text-red-500 font-black uppercase tracking-widest text-[10px]">
              <RotateCcw className="h-4 w-4 ml-2" />
              Factory Reset Parameters
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}