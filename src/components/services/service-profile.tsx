'use client';

import React from 'react';
import { MakrosService } from '@/types/makros-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ServiceStatusBadge from './service-status-badge';
import ServiceCategoryBadge from './service-category-badge';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, Fingerprint, Clock, Wrench, ShieldCheck, Activity, BarChart3, X, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ServiceProfileProps {
  service: MakrosService;
  linkedBookings: number;
  linkedJobCards: number;
  estimatedServiceRevenue: number;
  onClose: () => void;
}

const ServiceProfile: React.FC<ServiceProfileProps> = ({ 
  service, 
  linkedBookings, 
  linkedJobCards, 
  estimatedServiceRevenue,
  onClose
}) => {
  return (
    <Card className="h-[calc(100vh-220px)] border-border/50 bg-card shadow-2xl flex flex-col overflow-hidden text-foreground rounded-[2.5rem] premium-shadow animate-in slide-in-from-right-4 duration-500">
      <CardHeader className="bg-muted/30 p-8 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-3.5 w-3.5 text-primary" />
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">{service.serviceId.toUpperCase()}</p>
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tight leading-tight truncate max-w-[220px]">{service.serviceName}</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <ServiceStatusBadge status={service.status} className="text-[9px]" />
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-background border border-transparent hover:border-border/50">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="p-8 space-y-10">
          {/* Performance Matrix */}
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center group transition-all hover:bg-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Registry Load</p>
                  <p className="text-3xl font-black leading-none">{linkedBookings}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-2">Active Intakes</p>
              </div>
              <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10 text-center group transition-all hover:bg-indigo-500/10">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Operational</p>
                  <p className="text-3xl font-black leading-none">{linkedJobCards}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-2">Job Cycles</p>
              </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
              <div className="flex items-center gap-3 text-primary mb-4">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em]">Revenue Index</span>
              </div>
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Lifetime Billed</h4>
              <p className="text-4xl font-black text-white tracking-tighter"><CurrencyFormat value={estimatedServiceRevenue} /></p>
              <div className="flex items-center gap-2 mt-4 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                  <TrendingUp className="h-3 w-3 text-green-500" /> +12.4% vs last cycle
              </div>
          </div>

          {/* Technical Dossier */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center border border-border/50">
                    <Zap className="h-4 w-4" />
                </div>
                <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Technical Specification</h3>
            </div>
            <div className="pl-11 space-y-6">
                <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Catalog Profile</p>
                    <div className="p-5 rounded-2xl bg-muted/30 border border-dashed border-border/50">
                        <p className="text-xs font-medium leading-relaxed italic text-foreground/80">
                            &quot;{service.description || 'No detailed procedural specifications recorded for this catalog record.'}&quot;
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Labor rate</p>
                        <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-primary opacity-60" />
                            <p className="text-lg font-black text-primary"><CurrencyFormat value={service.defaultLaborCost} /></p>
                        </div>
                    </div>
                    <div className="space-y-1.5 text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Standard Cycle</p>
                        <div className="flex items-center justify-end gap-2">
                            <Clock className="h-4 w-4 text-indigo-500 opacity-60" />
                            <p className="text-lg font-black">{service.estimatedDuration}</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Operational Metadata */}
          <div className="space-y-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center border border-border/50">
                      <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Operational Parameters</h3>
              </div>
              <div className="pl-11 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Classification</span>
                      <ServiceCategoryBadge category={service.category} className="text-[9px]" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calibration Date</span>
                      <span className="text-xs font-bold uppercase"><FormattedDate date={service.updatedAt} formatString="dd MMM yyyy" /></span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enrollment Trace</span>
                      <span className="text-xs font-bold uppercase"><FormattedDate date={service.createdAt} formatString="dd MMM yyyy" /></span>
                  </div>
              </div>
          </div>
        </CardContent>
      </ScrollArea>
      
      <div className="bg-muted/30 px-8 py-6 border-t flex flex-col items-center justify-center shrink-0">
          <div className="flex items-center gap-3 text-muted-foreground/30 mb-2">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.6em]">Makros System Technical OS</p>
          </div>
          <p className="text-[8px] font-bold text-muted-foreground/20 uppercase tracking-widest">Certified Catalog Reference Record</p>
      </div>
    </Card>
  );
};

export default ServiceProfile;
