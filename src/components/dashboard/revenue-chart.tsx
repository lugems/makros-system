
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface RevenueChartProps {
  data: { name: string; revenue: number }[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <Card className="bg-card border-border/50 rounded-3xl overflow-hidden premium-shadow h-full">
      <CardHeader className="bg-muted/30 px-8 py-6 border-b flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Revenue Flow
          </CardTitle>
          <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">Monthly Fiscal Trajectory (Ush)</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/10">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Certified Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
              <XAxis 
                dataKey="name" 
                stroke="currentColor" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
                className="text-muted-foreground font-black uppercase tracking-tighter"
              />
              <YAxis 
                stroke="currentColor" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                className="text-muted-foreground font-bold"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '1rem',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                labelStyle={{
                  fontSize: '10px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '4px',
                  color: 'hsl(var(--muted-foreground))'
                }}
                itemStyle={{
                  fontSize: '14px',
                  fontWeight: '900',
                  color: 'hsl(var(--primary))'
                }}
                formatter={(value: number) => [`Ush ${value.toLocaleString()}`, 'Settled']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
