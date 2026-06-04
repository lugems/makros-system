'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const workflowStates = [
  'Received',
  'Diagnosing',
  'Waiting for Approval',
  'Waiting for Parts',
  'In Progress',
  'Quality Check',
  'Completed',
  'Invoiced',
  'Paid',
  'Delivered',
  'Cancelled',
];

const transitions = [
  { from: 'Received', to: 'Diagnosing' },
  { from: 'Diagnosing', to: 'Waiting for Approval' },
  { from: 'Waiting for Approval', to: 'Waiting for Parts' },
  { from: 'Waiting for Approval', to: 'In Progress' },
  { from: 'Waiting for Parts', to: 'In Progress' },
  { from: 'In Progress', to: 'Quality Check' },
  { from: 'Quality Check', to: 'Completed' },
  { from: 'Completed', to: 'Invoiced' },
  { from: 'Invoiced', to: 'Paid' },
  { from: 'Paid', to: 'Delivered' },
];

export function JobCardWorkflowSettings() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card shadow-sm">
            <CardHeader className="bg-muted/30 border-b p-8">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" /> Systemic State Registry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-3">
                {workflowStates.map((state) => (
                  <Badge 
                    key={state} 
                    variant="secondary" 
                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-muted/50 text-foreground border-none"
                  >
                    {state}
                  </Badge>
                ))}
              </div>
              
              <Separator className="my-10 opacity-50" />
              
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Authorized Logic Transitions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transitions.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all">
                      <span className="text-[10px] font-bold uppercase">{t.from}</span>
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-bold uppercase text-primary">{t.to}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 relative overflow-hidden group">
            <ShieldCheck className="absolute -right-4 -bottom-4 h-20 w-20 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
              <Info className="h-3 w-3" /> State Immutability
            </h4>
            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
              The Job Card lifecycle is currently locked to the GarageSync Core protocol. Custom state injection requires a system-level engine update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}