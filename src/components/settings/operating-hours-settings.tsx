'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, CalendarDays } from 'lucide-react';

interface OperatingHoursSettingsProps {
  data: { day: string; open: boolean; openingTime: string; closingTime: string }[] | undefined;
  onUpdate: (val: any) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function OperatingHoursSettings({ data = [], onUpdate }: OperatingHoursSettingsProps) {
  const updateDay = (dayName: string, field: string, value: any) => {
    const newData = DAYS.map(day => {
      const existing = data.find(d => d.day === day) || { day, open: false, openingTime: "08:00", closingTime: "17:00" };
      if (day === dayName) {
        return { ...existing, [field]: value };
      }
      return existing;
    });
    onUpdate(newData);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b p-8">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" /> Technical Intake Windows
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            {DAYS.map((day) => {
              const dayConfig = data.find(d => d.day === day) || { day, open: false, openingTime: "08:00", closingTime: "17:00" };
              return (
                <div 
                  key={day} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/10 transition-all gap-4"
                >
                  <div className="flex items-center gap-4 min-w-[140px]">
                    <Switch 
                      checked={dayConfig.open} 
                      onCheckedChange={(val) => updateDay(day, 'open', val)}
                    />
                    <span className={`text-xs font-black uppercase tracking-widest ${dayConfig.open ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
                      {day}
                    </span>
                  </div>
                  
                  {dayConfig.open ? (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input 
                          type="time" 
                          value={dayConfig.openingTime}
                          onChange={(e) => updateDay(day, 'openingTime', e.target.value)}
                          className="pl-9 h-10 w-32 bg-background border-border/50 rounded-xl text-[10px] font-bold"
                        />
                      </div>
                      <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">to</span>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input 
                          type="time" 
                          value={dayConfig.closingTime}
                          onChange={(e) => updateDay(day, 'closingTime', e.target.value)}
                          className="pl-9 h-10 w-32 bg-background border-border/50 rounded-xl text-[10px] font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-10 flex items-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] italic">Facility Locked</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}