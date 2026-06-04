'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsSectionCardProps {
  title: string;
  description: string;
  status: 'Configured' | 'Needs Review' | 'Disabled';
  icon: React.ReactNode;
  onManage: () => void;
}

const statusStyles = {
  Configured: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30',
  'Needs Review': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/30',
  Disabled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-800',
};

export function SettingsSectionCard({ title, description, status, icon, onManage }: SettingsSectionCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 flex flex-col h-full bg-card overflow-hidden">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            {icon}
          </div>
          <Badge className={cn('text-[10px] font-black uppercase px-2 py-0.5 border', statusStyles[status])}>
            {status}
          </Badge>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base font-black uppercase tracking-tight group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="text-xs font-medium leading-relaxed line-clamp-2">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="mt-auto pt-4 pb-4">
        <Button 
          variant="ghost" 
          onClick={onManage} 
          className="w-full justify-between h-9 text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-muted"
        >
          Configure Module
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
