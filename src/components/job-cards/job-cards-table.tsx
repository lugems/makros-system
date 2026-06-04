
'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, Query } from 'firebase/firestore';
import { JobCard } from '@/types/job-card';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
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
import { Wrench, Car, User, Fingerprint, Clock, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface JobCardsTableProps {
  jobCards: JobCard[];
  canManage?: boolean;
  onDelete?: (job: JobCard) => void;
}

export function JobCardsTable({ jobCards, canManage, onDelete }: JobCardsTableProps) {
  const db = useFirestore();
  const router = useRouter();

  // Resolve Names Context (Stable Queries)
  const customersQuery = useMemo(() => query(collection(db, 'customers')) as Query<Customer>, [db]);
  const vehiclesQuery = useMemo(() => query(collection(db, 'vehicles')) as Query<Vehicle>, [db]);
  const usersQuery = useMemo(() => query(collection(db, 'users')) as Query<StaffMember>, [db]);

  const { data: customers } = useCollection<Customer>(customersQuery as any);
  const { data: vehicles } = useCollection<Vehicle>(vehiclesQuery as any);
  const { data: users } = useCollection<StaffMember>(usersQuery as any);

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground">
          <TableHead className="px-6 py-4">Job Identity & Mechanic</TableHead>
          <TableHead className="px-6 py-4">Vehicle Identity</TableHead>
          <TableHead className="px-6 py-4">Client Dossier</TableHead>
          <TableHead className="px-6 py-4">Workflow State</TableHead>
          <TableHead className="px-6 py-4 text-right">Labor Estimate</TableHead>
          <TableHead className="px-6 py-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobCards.map((job) => {
          const customer = customers?.find(c => c.customerId === job.customerId);
          const vehicle = vehicles?.find(v => v.vehicleId === job.vehicleId);
          const mechanic = users?.find(u => u.userId === job.assignedMechanicId);

          return (
            <TableRow 
              key={job.jobCardId} 
              className="hover:bg-muted/30 transition-colors group cursor-pointer"
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
                    <Car className="h-3.5 w-3.5 text-primary/50" />
                    <span className="text-xs font-black uppercase tracking-tight">
                        {vehicle?.make} {vehicle?.model}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono font-black text-primary bg-primary/5 py-0 border-primary/10 rounded uppercase">
                      {vehicle?.numberPlate}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground uppercase tracking-tight">{customer?.fullName || 'Walk-in Client'}</p>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold uppercase">
                      <Clock className="h-2.5 w-2.5" />
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
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pt-1">Fixed Labor</p>
              </TableCell>
              <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-48">
                      <DropdownMenuItem onClick={() => router.push(`/job-cards/${job.jobCardId}`)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                          <Eye className="h-3.5 w-3.5" /> View Dossier
                      </DropdownMenuItem>
                      {canManage && (
                          <>
                              <DropdownMenuSeparator />
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
