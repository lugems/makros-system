'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MakrosService } from '@/types/makros-service';
import ServiceStatusBadge from './service-status-badge';
import ServiceCategoryBadge from './service-category-badge';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { Button } from '@/components/ui/button';
import { Clock, Wrench, Fingerprint, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: MakrosService;
  onEdit: (service: MakrosService) => void;
  onView: (service: MakrosService) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit, onView }) => {
  return (
    <Card className="flex flex-col h-full border-border/50 bg-card group hover:border-primary/40 transition-all duration-300 rounded-[2.5rem] premium-shadow overflow-hidden relative">
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/5 text-primary">
                    <Wrench className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <Fingerprint className="h-3 w-3 text-muted-foreground/40" />
                        <span className="text-[8px] font-mono font-black uppercase text-muted-foreground tracking-widest">
                            {service.serviceId.toUpperCase().slice(-8)}
                        </span>
                    </div>
                    <CardTitle className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-none mt-1 line-clamp-1">
                        {service.serviceName}
                    </CardTitle>
                </div>
            </div>
            <ServiceStatusBadge status={service.status} className="text-[7px]" />
        </div>
        <ServiceCategoryBadge category={service.category} className="text-[7px] w-fit" />
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 px-6 pt-0">
        <div className="bg-muted/30 p-4 rounded-2xl border border-dashed border-border/50 min-h-[4.5rem]">
            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed line-clamp-3 italic">
            {service.description || 'Detailed technical specifications pending for this catalog record.'}
            </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Labor Rate</p>
            <p className="text-base font-black text-primary leading-none">
              <CurrencyFormat value={service.defaultLaborCost} abbreviate />
            </p>
          </div>
          <div className="space-y-1 text-right">
             <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Cycle Time</p>
             <div className="flex items-center justify-end gap-1.5 text-xs font-black uppercase tracking-tight">
               <Clock className="h-3 w-3 text-indigo-500/60" />
               {service.estimatedDuration}
             </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-2">
        <div className="grid grid-cols-2 gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => onView(service)} className="h-10 text-[9px] font-black uppercase tracking-widest bg-background border-border/50 rounded-xl group-hover:border-primary/20">
                Inspect
            </Button>
            <Button size="sm" onClick={() => onEdit(service)} className="h-10 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10">
                Sync Record
            </Button>
        </div>
      </CardFooter>
      
      {/* Visual left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
    </Card>
  );
};

export default ServiceCard;
