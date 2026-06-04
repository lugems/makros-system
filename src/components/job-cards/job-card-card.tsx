
'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, Query } from 'firebase/firestore';
import { JobCard } from '@/types/job-card';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { StaffMember } from '@/types/staff';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobStatusBadge } from './job-status-badge';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { 
    User, 
    Car, 
    Fingerprint, 
    Clock,
    MoreHorizontal,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface JobCardCardProps {
  job: JobCard;
}

export function JobCardCard({ job }: JobCardCardProps) {
  const db = useFirestore();
  const router = useRouter();

  // Resolve Names Context (Stable Queries)
  const customersQuery = useMemo(() => query(collection(db, 'customers')) as Query<Customer>, [db]);
  const vehiclesQuery = useMemo(() => query(collection(db, 'vehicles')) as Query<Vehicle>, [db]);
  const usersQuery = useMemo(() => query(collection(db, 'users')) as Query<StaffMember>, [db]);

  const { data: customers } = useCollection<Customer>(customersQuery as any);
  const { data: vehicles } = useCollection<Vehicle>(vehiclesQuery as any);
  const { data: users } = useCollection<StaffMember>(usersQuery as any);
  
  const customer = customers?.find(c => c.customerId === job.customerId);
  const vehicle = vehicles?.find(v => v.vehicleId === job.vehicleId);
  const mechanic = users?.find(u => u.userId === job.assignedMechanicId);

  return (
    <Card className="hover:border-primary/40 transition-all group relative overflow-hidden bg-card border-border/50 shadow-sm rounded-3xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Fingerprint className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-mono font-black uppercase text-muted-foreground tracking-widest">
                        {job.jobCardId.toUpperCase()}
                    </span>
                </div>
                <p className="text-sm font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                    {mechanic?.fullName || 'UNASSIGNED'}
                </p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Primary Technician</p>
            </div>
            <JobStatusBadge status={job.status} className="text-[8px] py-0.5" />
        </div>

        <div className="space-y-3">
            <div className="bg-muted/30 p-4 rounded-2xl border border-dashed border-border/50">
                <div className="flex items-center gap-2 mb-2">
                    <Car className="h-3.5 w-3.5 text-primary/50" />
                    <span className="text-xs font-black uppercase tracking-tight">{vehicle?.make} {vehicle?.model || 'Generic Unit'}</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono font-black text-primary bg-primary/5 py-0.5 border-primary/10 rounded uppercase">
                    {vehicle?.numberPlate || 'NO_PLATE'}
                </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/80">
                <User className="h-3 w-3 text-muted-foreground/40" />
                <span className="truncate uppercase">{customer?.fullName || 'Walk-in Client'}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
            <div className="space-y-0.5">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Labor Yield</p>
                <p className="text-base font-black text-primary leading-none">
                    <CurrencyFormat value={job.laborCost} />
                </p>
            </div>
            <div className="text-right space-y-0.5">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Sync Date</p>
                <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold">
                    <Clock className="h-2.5 w-2.5 opacity-40" />
                    <FormattedDate date={job.createdAt} formatString="dd MMM" />
                </div>
            </div>
        </div>

        <div className="flex gap-2 pt-1">
            <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-10 text-[9px] font-black uppercase tracking-widest bg-background rounded-xl"
                onClick={() => router.push(`/job-cards/${job.jobCardId}`)}
            >
                Inspect Dossier
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-10 w-10 rounded-xl border border-border/50"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-48">
                    <DropdownMenuItem onClick={() => router.push(`/job-cards/${job.jobCardId}`)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Eye className="h-3.5 w-3.5" /> View Full Record
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardContent>
      
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />
    </Card>
  );
}
