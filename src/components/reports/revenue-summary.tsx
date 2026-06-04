'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth } from 'date-fns';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { TrendingUp, Banknote, History } from 'lucide-react';

interface RevenueSummaryProps {
  payments: any[];
}

const RevenueSummary = ({ payments }: RevenueSummaryProps) => {
  const chartData = React.useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const monthDate = subMonths(startOfMonth(today), 5 - i);
      const monthLabel = format(monthDate, 'MMM');
      const monthKey = format(monthDate, 'MMM yyyy');
      
      const monthRevenue = payments
        .filter(p => {
          const payDate = p.paidAt?.toDate ? p.paidAt.toDate() : new Date(p.paidAt);
          return format(payDate, 'MMM yyyy') === monthKey;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);
        
      return { name: monthLabel, revenue: monthRevenue };
    });
  }, [payments]);

  return (
    <Card className="rounded-[2.5rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow h-full">
      <CardHeader className="bg-muted/30 border-b p-8 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" /> Financial Flow
            </CardTitle>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Monthly Realized Revenue Trajectory</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/20">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Certified Live</span>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                className="text-muted-foreground font-black uppercase tracking-tighter"
                dy={10}
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                className="text-muted-foreground font-bold"
                tickFormatter={(val) => `${(val/1000000).toFixed(0)}M`}
              />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '1.25rem',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px'
                }}
                labelStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', color: 'hsl(var(--muted-foreground))' }}
                itemStyle={{ fontSize: '16px', fontWeight: '900', color: 'hsl(var(--primary))' }}
                formatter={(val: number) => [`Ush ${val.toLocaleString()}`, 'Settled']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorRev)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueSummary;
