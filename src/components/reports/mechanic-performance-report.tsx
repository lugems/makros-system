'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Activity, Wrench, CheckCircle2, ShieldCheck, TrendingUp } from 'lucide-react';
import { JobCardStatus } from '@/types/job-card';
import { cn } from '@/lib/utils';

interface MechanicPerformanceReportProps {
  jobCards: any[];
  staff: any[];
  specificUserId?: string;
}

/**
 * @fileOverview Technical Throughput & Efficiency Index.
 * Analyzes personnel output against active bay load and historical completions.
 */
const MechanicPerformanceReport = ({ jobCards, staff, specificUserId }: MechanicPerformanceReportProps) => {
  const mechanics = React.useMemo(() => {
    // Isolate technical personnel
    const baseList = specificUserId 
      ? staff.filter(s => s.userId === specificUserId) 
      : staff.filter(s => s.role === 'Mechanic');
    
    return baseList
        .map(m => {
            const assigned = jobCards.filter(j => j.assignedMechanicId === m.userId);
            
            // Completion is defined as moving past the Quality Check phase
            const completedStatuses = [
              JobCardStatus.Completed, 
              JobCardStatus.Invoiced, 
              JobCardStatus.Paid, 
              JobCardStatus.Delivered
            ] as string[];
            
            // Active load includes all states where a technician is assigned and working
            const activeStatuses = [
              JobCardStatus.InProgress, 
              JobCardStatus.Diagnosing, 
              JobCardStatus.QualityCheck, 
              JobCardStatus.WaitingForParts,
              JobCardStatus.WaitingForApproval
            ] as string[];

            const completed = assigned.filter(j => completedStatuses.includes(j.status)).length;
            const active = assigned.filter(j => activeStatuses.includes(j.status)).length;
            
            // Efficiency Index: Ratio of completed tasks to total operational tasks
            const totalOperational = completed + active;
            const efficiency = totalOperational > 0 ? Math.round((completed / totalOperational) * 100) : 0;
            
            return {
                ...m,
                completedCount: completed,
                activeCount: active,
                efficiency,
                totalTracked: assigned.length
            };
        })
        .sort((a, b) => b.completedCount - a.completedCount);
  }, [jobCards, staff, specificUserId]);

  return (
    <Card className="rounded-[2.5rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow h-full">
      <CardHeader className="bg-muted/30 border-b p-8 space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" /> Operational Efficiency
          </CardTitle>
          <Badge className="bg-indigo-500/10 text-indigo-600 border-none text-[8px] font-black uppercase px-3 py-1">
             Performance Index Active
          </Badge>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            {specificUserId ? 'Personal Throughput & Fidelity Tracker' : 'Technician Throughput & Efficiency Index'}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 border-none uppercase text-[9px] font-black tracking-[0.3em]">
                <TableHead className="px-8 h-14">Personnel Unit</TableHead>
                <TableHead className="px-8 text-center h-14">Operational Trace</TableHead>
                <TableHead className="px-8 h-14">Fidelity Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mechanics.map((mechanic) => (
                <TableRow key={mechanic.userId} className="hover:bg-muted/30 border-border/50 group transition-all">
                  <TableCell className="px-8 py-8">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                          <Avatar className="h-12 w-12 ring-4 ring-primary/5 shadow-xl">
                              <AvatarImage src={`https://picsum.photos/seed/${mechanic.userId}/200/200`} />
                              <AvatarFallback className="font-black text-xs bg-primary/5 text-primary">{mechanic.fullName?.[0]}</AvatarFallback>
                          </Avatar>
                          {mechanic.efficiency >= 85 && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-background shadow-lg">
                                  <ShieldCheck className="h-2.5 w-2.5 text-white" />
                              </div>
                          )}
                      </div>
                      <div className="space-y-1">
                          <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-none">{mechanic.fullName}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-muted-foreground font-bold tracking-tighter uppercase">ID: {mechanic.userId.slice(-8)}</span>
                            <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">• {mechanic.specialization || 'General Services'}</span>
                          </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 text-center">
                      <div className="flex items-center justify-center gap-6">
                          <div className="text-center group/stat">
                              <p className="text-xl font-black leading-none tabular-nums group-hover/stat:scale-110 transition-transform">{mechanic.completedCount}</p>
                              <p className="text-[8px] font-black text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Settled</p>
                          </div>
                          <div className="w-px h-8 bg-border/40 mx-2" />
                          <div className="text-center group/stat">
                              <p className="text-xl font-black leading-none text-primary tabular-nums group-hover/stat:scale-110 transition-transform">{mechanic.activeCount}</p>
                              <p className="text-[8px] font-black text-primary uppercase mt-2 tracking-widest opacity-60">In-Bay</p>
                          </div>
                      </div>
                  </TableCell>
                  <TableCell className="px-8 min-w-[240px]">
                      <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                              <span className="text-muted-foreground">Systemic Efficiency</span>
                              <span className={cn(
                                  "tabular-nums",
                                  mechanic.efficiency >= 80 ? "text-green-600" : 
                                  mechanic.efficiency >= 50 ? "text-amber-600" : "text-destructive"
                              )}>{mechanic.efficiency}%</span>
                          </div>
                          <div className="relative pt-1">
                            <Progress value={mechanic.efficiency} className="h-2 rounded-full bg-muted shadow-inner" />
                            <div className="absolute top-1/2 -translate-y-1/2 left-[80%] h-3 w-0.5 bg-green-500/20" title="Target Baseline" />
                          </div>
                      </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {mechanics.length === 0 && (
            <div className="py-32 text-center opacity-30 italic text-sm text-muted-foreground flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-muted flex items-center justify-center border border-border/50">
                    <Wrench className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                    <p className="font-black uppercase tracking-[0.2em]">Registry Unpopulated</p>
                    <p className="text-xs">No technical personnel output detected for this interval.</p>
                </div>
            </div>
        )}
      </CardContent>
      <div className="bg-muted/30 px-8 py-5 border-t flex items-center justify-center">
          <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.5em]">Forensic Personnel Analysis Trace Active</p>
      </div>
    </Card>
  );
};

export default MechanicPerformanceReport;

import { Badge } from '@/components/ui/badge';
