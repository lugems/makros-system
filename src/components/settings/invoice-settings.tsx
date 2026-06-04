'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { WorkshopSettings } from '@/types/settings';
import { FileText, Receipt, Percent, Hash, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface InvoiceSettingsProps {
  data: Partial<WorkshopSettings> | null;
  onUpdate: (field: keyof WorkshopSettings, value: any) => void;
}

export function InvoiceSettings({ data, onUpdate }: InvoiceSettingsProps) {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" /> Sequencing Protocols
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Invoice Prefix</Label>
                <Input 
                  value={data?.invoicePrefix || ''} 
                  onChange={(e) => onUpdate('invoicePrefix', e.target.value)}
                  className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Starting Number</Label>
                <Input 
                  type="number"
                  value={data?.invoiceStartNumber || ''} 
                  onChange={(e) => onUpdate('invoiceStartNumber', parseInt(e.target.value))}
                  className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Receipt Prefix</Label>
              <Input 
                value={data?.receiptPrefix || ''} 
                onChange={(e) => onUpdate('receiptPrefix', e.target.value)}
                className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold uppercase"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" /> Fiscal Calibration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="space-y-0.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Taxation Engine</Label>
                <p className="text-[10px] text-muted-foreground font-medium">Toggle global tax calculation</p>
              </div>
              <Switch 
                checked={data?.taxEnabled} 
                onCheckedChange={(val) => onUpdate('taxEnabled', val)} 
              />
            </div>
            
            {data?.taxEnabled && (
              <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tax Label (e.g. VAT)</Label>
                  <Input 
                    value={data?.taxName || ''} 
                    onChange={(e) => onUpdate('taxName', e.target.value)}
                    className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rate (%)</Label>
                  <Input 
                    type="number"
                    value={data?.taxRate || ''} 
                    onChange={(e) => onUpdate('taxRate', parseFloat(e.target.value))}
                    className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold"
                  />
                </div>
              </div>
            )}

            <Separator className="opacity-50" />

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                <Tag className="h-3 w-3" /> Default Discount (%)
              </Label>
              <Input 
                type="number"
                value={data?.defaultDiscount || 0} 
                onChange={(e) => onUpdate('defaultDiscount', parseFloat(e.target.value) || 0)}
                className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold"
              />
              <p className="text-[9px] font-bold text-muted-foreground/60 uppercase ml-1">Proposed reduction (percentage) applied to new billing records.</p>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Document Footer Note</Label>
              <div className="relative">
                <Receipt className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
                <textarea 
                  value={data?.receiptFooterNote || ''} 
                  onChange={(e) => onUpdate('receiptFooterNote', e.target.value)}
                  className="w-full min-h-[100px] pl-11 pt-3 bg-muted/20 border border-border/50 rounded-xl font-medium focus-visible:ring-primary/20 outline-none text-sm"
                  placeholder="Thank you for trusting Makros System..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
