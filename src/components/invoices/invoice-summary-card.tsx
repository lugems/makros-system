'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InvoiceSummaryCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  trend?: string;
  gradient?: 'blue' | 'green' | 'orange' | 'purple';
}

export const InvoiceSummaryCard: React.FC<InvoiceSummaryCardProps> = ({ 
    title, 
    value, 
    icon, 
    className,
    trend,
    gradient 
}) => {
  const gradientStyles = {
    blue: "dashboard-gradient-blue border-none text-white shadow-lg shadow-blue-500/20",
    green: "dashboard-gradient-green border-none text-white shadow-lg shadow-green-500/20",
    orange: "dashboard-gradient-orange border-none text-white shadow-lg shadow-orange-500/20",
    purple: "dashboard-gradient-purple border-none text-white shadow-lg shadow-purple-500/20",
  };

  return (
    <Card className={cn(
        "bg-card border-border/40 overflow-hidden relative group transition-all duration-500 rounded-[1.5rem] sm:rounded-[2rem]",
        gradient ? gradientStyles[gradient] : "hover:border-primary/30",
        className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-5 sm:p-8 relative z-10">
        <CardTitle className={cn(
            "text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]",
            gradient ? "text-white/80" : "text-muted-foreground"
        )}>
            {title}
        </CardTitle>
        <div className={cn(
            "p-2 rounded-xl transition-all group-hover:scale-110 group-hover:rotate-6 duration-300",
            gradient ? "bg-white/20 text-white border border-white/10 backdrop-blur-md" : "bg-primary/10 text-primary border border-primary/20"
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 px-5 sm:px-8 pb-5 sm:pb-8 pt-0">
        <div className="text-2xl sm:text-4xl font-black tracking-tighter leading-none">{value}</div>
        {trend && (
            <p className={cn(
                "text-[8px] sm:text-[10px] font-bold uppercase tracking-widest mt-2",
                gradient ? "text-white/50" : "text-muted-foreground/60"
            )}>
                {trend}
            </p>
        )}
      </CardContent>
      {gradient && (
          <>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute right-4 bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          </>
      )}
    </Card>
  );
};

export default InvoiceSummaryCard;
