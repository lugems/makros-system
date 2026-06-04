
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: 'purple' | 'blue' | 'orange' | 'green';
}

export const StatsCard = ({ title, value, subtitle, icon, gradient }: StatsCardProps) => {
  const gradientClass = gradient ? `dashboard-gradient-${gradient}` : 'bg-card';
  
  return (
    <Card className={cn(
      "border-border/40 overflow-hidden relative group hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 premium-shadow rounded-[2rem]", 
      gradientClass,
      !gradient && "bg-card"
    )}>
      <CardContent className="p-8">
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-4">
            <p className={cn(
              "text-[10px] font-black uppercase tracking-[0.3em]", 
              gradient ? "text-white/70" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <div className={cn(
              "text-5xl font-black tracking-tighter", 
              gradient ? "text-white" : "text-foreground"
            )}>
              {value}
            </div>
            {subtitle && (
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-widest", 
                gradient ? "text-white/50" : "text-muted-foreground/60"
              )}>
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn(
              "p-4 rounded-2xl transition-all group-hover:scale-110 group-hover:rotate-6 duration-500", 
              gradient ? "bg-white/20 text-white backdrop-blur-md border border-white/10" : "bg-primary/10 text-primary border border-primary/20"
            )}>
              {icon}
            </div>
          )}
        </div>
        
        {gradient && (
          <>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute right-4 bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          </>
        )}
      </CardContent>
    </Card>
  );
};
