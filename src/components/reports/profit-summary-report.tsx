'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, ArrowUpRight, ShieldCheck, Activity, BarChart3, Info } from 'lucide-react';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { Separator } from '@/components/ui/separator';

interface ProfitSummaryReportProps {
  invoices: any[];
  payments: any[];
}

export function ProfitSummaryReport({ invoices, payments }: ProfitSummaryReportProps) {
  const metrics = React.useMemo(() => {
    const grossBilled = invoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);
    const costOfParts = invoices.reduce((sum, i) => sum + (i.partsTotal || 0), 0);
    const netCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Simple profit index (Labor total)
    const laborProfit = invoices.reduce((sum, i) => sum + (i.laborTotal || 0), 0);
    const collectionEfficiency = grossBilled > 0 ? (netCollected / grossBilled) * 100 : 0;

    return { grossBilled, costOfParts, netCollected, laborProfit, collectionEfficiency };
  }, [invoices, payments]);

  return (
    <Card className="rounded-[2.5rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow h-full">
      <CardHeader className="bg-muted/30 border-b p-8 space-y-1">
        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-500" /> Fiscal Profitability
        </CardTitle>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Consolidated Revenue vs Operational Margin</p>
      </CardHeader>
      <CardContent className="p-8 space-y-10">
        <div className="bg-slate-900 p-10 rounded-[2rem] text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700">
                <TrendingUp className="h-40 w-40" />
            </div>
            <div className="relative z-10 space-y-3">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Operational Margin (Labor)</p>
                <p className="text-5xl font-black tracking-tighter leading-none">
                    <CurrencyFormat value={metrics.laborProfit} />
                </p>
                <div className="flex items-center gap-3 pt-3">
                    <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                    </div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">Certified Revenue Ledger Sync</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-10 px-2">
            <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Inventory Outlay</p>
                <p className="text-2xl font-black text-foreground tracking-tighter">
                    <CurrencyFormat value={metrics.costOfParts} abbreviate />
                </p>
                <Separator className="opacity-50" />
                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase italic leading-relaxed">
                    Cumulative capital allocated to material registry.
                </p>
            </div>
            <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Liquidity Conversion</p>
                <div className="flex items-end gap-2">
                    <p className="text-4xl font-black text-indigo-600 leading-none tracking-tighter">{metrics.collectionEfficiency.toFixed(0)}%</p>
                    <ArrowUpRight className="h-5 w-5 text-green-500 mb-1" />
                </div>
                <Separator className="opacity-50" />
                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase italic leading-relaxed">
                    Rate of authorized billing converted to verified cash.
                </p>
            </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 p-6 rounded-[1.75rem] relative overflow-hidden group">
            <Activity className="absolute -right-4 -bottom-4 h-20 w-20 text-primary/5 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-start gap-4 relative z-10">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                    <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Fiscal Pulse Insight</h4>
                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic">
                        Workshop profitability is currently sustained by high-margin labor cycles. Optimizing material turnover and debt collection will further harden the liquidity baseline.
                    </p>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
