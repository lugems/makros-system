'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { JobCard } from '@/types/job-card';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { PlantEquipment } from '@/types/plant-equipment';
import { StaffMember } from '@/types/staff';
import { JobStatusBadge } from './job-status-badge';
import { FormattedDate } from '@/components/shared/formatted-date';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Car, User, Fingerprint, Clock, MoreHorizontal, Eye, Trash2, Hammer, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface JobCardsTableProps {
  jobCards: JobCard[];
  canManage?: boolean;
  onDelete?: (job: JobCard) => void;
}

/**
 * @fileOverview Technical registry table for workshop operations.
 * Hardened polymorphic resolution with "Unified Discovery" fallback for legacy records.
 */
export function JobCardsTable({ jobCards, canManage, onDelete }: JobCardsTableProps) {
  const db = useFirestore();
  const router = useRouter();

  // Real-time Technical Context (Stabilized)
  const customersQuery = useMemoFirebase(() => query(collection(db, 'customers')), [db]);
  const vehiclesQuery = useMemoFirebase(() => query(collection(db, 'vehicles')), [db]);
  const plantsQuery = useMemoFirebase(() => query(collection(db, 'plantsAndEquipment')), [db]);
  const usersQuery = useMemoFirebase(() => query(collection(db, 'users')), [db]);

  const { data: customers } = useCollection<Customer>(customersQuery as any);
  const { data: vehicles } = useCollection<Vehicle>(vehiclesQuery as any);
  const { data: plants } = useCollection<PlantEquipment>(plantsQuery as any);
  const { data: users } = useCollection<StaffMember>(usersQuery as any);

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground border-none">
          <TableHead className="px-6 py-4">Job Identity & Lead</TableHead>
          <TableHead className="px-6 py-4">Technical Asset</TableHead>
          <TableHead className="px-6 py-4">Client Dossier</TableHead>
          <TableHead className="px-6 py-4">Workflow State</TableHead>
          <TableHead className="px-6 py-4 text-right">Labor Yield</TableHead>
          <TableHead className="px-6 py-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobCards.map((job) => {
          const customer = customers?.find(c => (c.customerId === job.customerId || (c as any).id === job.customerId));
          const mechanic = users?.find(u => u.userId === job.assignedMechanicId);
          
          // POLYMORPHIC RESOLUTION: Priority based on stored assetType with Discovery Fallback
          let assetType = job.assetType;
          const assetId = job.assetId || job.vehicleId;

          if (!assetType && assetId) {
              const existsInVehicles = vehicles?.some(v => (v.vehicleId === assetId || (v as any).id === assetId));
              assetType = existsInVehicles ? 'Vehicle' : 'Plant';
          }
          
          let assetLabel = 'Registry Trace...';
          let assetSubLabel = 'NO_REF';
          const isVehicle = assetType === 'Vehicle';
          
          if (isVehicle) {
              const v = vehicles?.find(v => (v.vehicleId === assetId || (v as any).id === assetId));
              assetLabel = v ? `${v.make} ${v.model}` : assetLabel;
              assetSubLabel = v?.numberPlate || assetSubLabel;
          } else {
              const p = plants?.find(p => (p.id === assetId || (p as any).id === assetId));
              assetLabel = p ? p.name : assetLabel;
              assetSubLabel = p?.assetId || assetSubLabel;
          }

          return (
            <TableRow 
              key={job.jobCardId} 
              className="hover:bg-muted/30 transition-colors group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary/40"
              onClick={() => router.push(`/job-cards/${job.jobCardId}`)}
            >
              <TableCell className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/5">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <Fingerprint className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[9px] font-mono text-muted-foreground font-black uppercase tracking-tight">
                            {job.jobCardId.toUpperCase().slice(-8)}
                        </span>
                    </div>
                    <p className="text-sm font-black group-hover:text-primary transition-colors uppercase tracking-tight leading-none">
                      {mechanic?.fullName || 'UNASSIGNED'}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {isVehicle ? <Car className="h-3.5 w-3.5 text-primary/50" /> : <Hammer className="h-3.5 w-3.5 text-primary/50" />}
                    <span className="text-xs font-black uppercase tracking-tight">
                        {assetLabel}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono font-black text-primary bg-primary/5 py-0 border-primary/10 rounded uppercase">
                      {assetSubLabel}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground uppercase tracking-tight truncate max-w-[120px]">{customer?.fullName || 'Walk-in Client'}</p>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold uppercase">
                      <Clock className="h-2.5 w-2.5 opacity-40" />
                      <FormattedDate date={job.createdAt} formatString="dd MMM yyyy" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <JobStatusBadge status={job.status} />
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <p className="text-sm font-black text-primary leading-none">
                  <CurrencyFormat value={job.laborCost} />
                </p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pt-1">Fixed Rate</p>
              </TableCell>
              <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-48 border-border/50">
                          <DropdownMenuItem onClick={() => router.push(`/job-cards/${job.jobCardId}`)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                              <Eye className="h-3.5 w-3.5" /> View Dossier
                          </DropdownMenuItem>
                          {canManage && (
                              <>
                                  <DropdownMenuSeparator className="opacity-50" />
                                  <DropdownMenuItem 
                                      onClick={() => onDelete?.(job)} 
                                      className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  >
                                      <Trash2 className="h-3.5 w-3.5" /> Purge Operation
                                  </DropdownMenuItem>
                              </>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
