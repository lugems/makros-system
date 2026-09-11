'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CurrencyFormat } from '@/components/shared/currency-format';

interface PaymentsMethodReportProps {
  payments: any[];
}

export function PaymentsMethodReport({ payments }: PaymentsMethodReportProps) {
  const chartData = React.useMemo(() => {
    const methods: Record<string, number> = {
      'Cash': 0,
      'Mobile Money': 0,
      'Bank Transfer': 0,
      'Card': 0
    };

    payments.forEach(p => {
      if (methods[p.method] !== undefined) {
        methods[p.method] += (p.amount || 0);
      }
    });

    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [payments]);

  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'];

  return (
    <Card className="rounded-2xl sm:rounded-[2rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow h-full">
      <CardHeader className="bg-muted/30 border-b p-4 sm:p-6 space-y-1">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" /> Settlement Channels
        </CardTitle>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Treasury Intake by Payment Protocol</p>
      </CardHeader>
      <CardContent className="p-4 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="h-[200px] sm:h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => `Ush ${value.toLocaleString()}`}
                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-3 sm:space-y-4">
                {chartData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                        </div>
                        <span className="text-xs font-black"><CurrencyFormat value={item.value} abbreviate /></span>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
