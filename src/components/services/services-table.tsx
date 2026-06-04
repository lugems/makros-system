'use client';

import React from 'react';
import { MakrosService } from '@/types/makros-service';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Activity, Fingerprint, Clock, Wrench, Trash2 } from 'lucide-react';
import ServiceStatusBadge from './service-status-badge';
import ServiceCategoryBadge from './service-category-badge';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ServicesTableProps {
  services: MakrosService[];
  onEdit: (service: MakrosService) => void;
  onView: (service: MakrosService) => void;
  onToggleStatus: (service: MakrosService) => void;
  onDelete: (service: MakrosService) => void;
  selectedId?: string | null;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({ services, onEdit, onView, onToggleStatus, onDelete, selectedId }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground border-none">
          <TableHead className="px-8 py-5">Service Identity</TableHead>
          <TableHead className="px-8 py-5">Category Reference</TableHead>
          <TableHead className="px-8 py-5">Operational Status</TableHead>
          <TableHead className="px-8 py-5 text-right">Base Labor Rate</TableHead>
          <TableHead className="px-8 py-5">Temporal Cycle</TableHead>
          <TableHead className="px-8 py-5 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => {
          const isActive = selectedId === service.serviceId;
          
          return (
            <TableRow 
              key={service.serviceId} 
              className={cn(
                "hover:bg-muted/30 transition-colors group cursor-pointer border-l-4 border-l-transparent",
                isActive ? "bg-primary/[0.04] border-l-primary" : "border-border/50"
              )}
              onClick={() => onView(service)}
            >
              <TableCell className="px-8 py-6">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300",
                    isActive ? "bg-primary text-white border-primary/20 shadow-lg shadow-primary/20 scale-105" : "bg-primary/5 border-primary/10 text-primary"
                  )}>
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className={cn(
                        "text-sm font-black uppercase tracking-tight leading-none transition-colors",
                        isActive ? "text-primary" : "group-hover:text-primary"
                    )}>
                      {service.serviceName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-3.5 w-3.5 text-muted-foreground/30" />
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-tighter">
                          {service.serviceId.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-8 py-6">
                <ServiceCategoryBadge category={service.category} className="text-[8px]" />
              </TableCell>
              <TableCell className="px-8 py-6">
                <ServiceStatusBadge status={service.status} className="text-[8px]" />
              </TableCell>
              <TableCell className="px-8 py-6 text-right">
                  <p className="text-base font-black text-foreground tabular-nums tracking-tighter">
                      <CurrencyFormat value={service.defaultLaborCost} />
                  </p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pt-1 opacity-40">Fixed Rate</p>
              </TableCell>
              <TableCell className="px-8 py-6">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10">
                    <Clock className="h-3.5 w-3.5 text-indigo-500 opacity-60" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight text-foreground/80">{service.estimatedDuration}</span>
                </div>
              </TableCell>
              <TableCell className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl p-2 shadow-2xl w-52 border-border/50">
                    <DropdownMenuItem onClick={() => onView(service)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                      <Eye className="h-4 w-4 text-primary" />
                      Inspect Dossier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(service)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                      <Edit className="h-4 w-4 text-primary" />
                      Update Record
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(service)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                      <Activity className="h-4 w-4 text-primary" />
                      {service.status === 'Active' ? 'Deactivate' : 'Restore Duty'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem 
                      onClick={() => onDelete(service)} 
                      className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Purge Catalog
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
