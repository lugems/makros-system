'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlantEquipment } from '@/types/plant-equipment';
import { Customer } from '@/types/customer';
import { Hammer, User, Fingerprint, Gauge, MoreHorizontal, Eye, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMeterUnit } from '@/services/asset-resolver-service';

interface PlantTableProps {
  plants: PlantEquipment[];
  customers: Customer[];
}

export function PlantTable({ plants, customers }: PlantTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-3xl border bg-card overflow-hidden shadow-sm premium-shadow">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground border-none">
            <TableHead className="px-8 py-5">Equipment Identity</TableHead>
            <TableHead className="px-8 py-5">Asset Reference</TableHead>
            <TableHead className="px-8 py-5">Telemetry</TableHead>
            <TableHead className="px-8 py-5">Owner Authority</TableHead>
            <TableHead className="px-8 py-5">Registry Status</TableHead>
            <TableHead className="px-8 py-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plants.map((plant) => {
            const customer = customers.find(c => c.customerId === plant.ownerId);
            const unit = getMeterUnit(plant.meterType);

            return (
              <TableRow 
                key={plant.id} 
                className="hover:bg-muted/30 transition-colors group cursor-pointer border-border/40"
                onClick={() => router.push(`/plants-equipment/${plant.id}`)}
              >
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className="h-11 w-11 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Hammer className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-none">{plant.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{plant.make} {plant.model}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Fingerprint className="h-3 w-3 text-primary opacity-40" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-foreground/80">{plant.assetId}</span>
                    </div>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">S/N: {plant.serialNumber}</p>
                  </div>
                </TableCell>
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10">
                      <Gauge className="h-3.5 w-3.5 text-indigo-500 opacity-60" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs font-black tabular-nums">{plant.meterReading.toLocaleString()}</p>
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">{unit}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3.5 w-3.5 opacity-40" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-tight text-foreground/80 truncate max-w-[120px]">{customer?.fullName || 'Registry Void'}</span>
                    </div>
                </TableCell>
                <TableCell className="px-8 py-6">
                  <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-3 py-0.5 rounded-lg",
                      plant.status === 'Active' ? "bg-green-500/5 text-green-600 border-green-200" : "bg-muted text-muted-foreground"
                  )}>
                    {plant.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
