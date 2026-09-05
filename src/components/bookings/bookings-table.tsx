'use client';

import React from 'react';
import { Booking } from '@/types/booking';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, Query } from 'firebase/firestore';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { PlantEquipment } from '@/types/plant-equipment';
import { MakrosService } from '@/types/makros-service';
import { BookingStatusBadge } from './booking-status-badge';
import { FormattedDate } from '@/components/shared/formatted-date';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Wrench, Car, Hash, ChevronRight, Hammer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingsTableProps {
  bookings: Booking[];
  onSelect: (booking: Booking) => void;
  selectedId?: string | null;
}

/**
 * @fileOverview Technical registry table for service intakes.
 * Synchronizes with real-time assets and client dossiers for forensic accuracy.
 */
export function BookingsTable({ bookings, onSelect, selectedId }: BookingsTableProps) {
  const db = useFirestore();

  // Live Technical Streams (Stabilized)
  const custQuery = useMemoFirebase(() => query(collection(db, 'customers')) as Query<Customer>, [db]);
  const vehQuery = useMemoFirebase(() => query(collection(db, 'vehicles')) as Query<Vehicle>, [db]);
  const plantQuery = useMemoFirebase(() => query(collection(db, 'plantsAndEquipment')) as Query<PlantEquipment>, [db]);
  const srvQuery = useMemoFirebase(() => query(collection(db, 'services')) as Query<MakrosService>, [db]);

  const { data: customers } = useCollection<Customer>(custQuery as any);
  const { data: vehicles } = useCollection<Vehicle>(vehQuery as any);
  const { data: plants } = useCollection<PlantEquipment>(plantQuery as any);
  const { data: services } = useCollection<MakrosService>(srvQuery as any);

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground">
            <TableHead className="px-6 py-4">Client Identity & Reference</TableHead>
            <TableHead className="px-6 py-4">Technical Asset</TableHead>
            <TableHead className="px-6 py-4 text-center">Schedule</TableHead>
            <TableHead className="px-6 py-4 text-right">Registry Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const customer = customers?.find(c => (c.customerId === booking.customerId || (c as any).id === booking.customerId));
            const isActive = selectedId === booking.bookingId;
            
            const assetType = booking.assetType || 'Vehicle';
            const assetId = booking.assetId || booking.vehicleId;
            
            let assetLabel = 'Unit Trace...';
            let assetRef = 'NO_REF';
            
            if (assetType === 'Vehicle') {
                const v = vehicles?.find(v => (v.vehicleId === assetId || (v as any).id === assetId));
                assetLabel = v ? `${v.make} ${v.model}` : assetLabel;
                assetRef = v?.numberPlate || assetRef;
            } else {
                const p = plants?.find(p => (p.id === assetId || (p as any).id === assetId));
                assetLabel = p ? p.name : assetLabel;
                assetRef = p?.assetId || assetRef;
            }

            return (
              <TableRow 
                key={booking.bookingId} 
                className={cn(
                    "cursor-pointer hover:bg-muted/30 transition-all group border-l-4 border-l-transparent",
                    isActive && "bg-primary/5 border-l-primary"
                )}
                onClick={() => onSelect(booking)}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/5 shadow-sm">
                      <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                        {customer?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-black group-hover:text-primary transition-colors uppercase tracking-tight">
                        {customer?.fullName || 'Walk-in Client'}
                      </p>
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 text-primary/50" />
                        <span className="text-[9px] font-mono text-muted-foreground font-bold uppercase tracking-widest">
                          {booking.bookingId.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight text-foreground/80">
                        {assetType === 'Vehicle' ? <Car className="h-3.5 w-3.5 text-primary/50" /> : <Hammer className="h-3.5 w-3.5 text-primary/50" />}
                        {assetLabel}
                    </div>
                    <p className="text-[10px] font-mono text-primary bg-primary/5 w-fit px-2 py-0.5 rounded font-black border border-primary/10 uppercase">
                        {assetRef}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <div className="inline-flex flex-col items-center bg-muted/20 px-3 py-2 rounded-xl border border-transparent group-hover:border-primary/10 transition-all">
                    <div className="text-xs font-black flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-indigo-500" />
                      <FormattedDate date={booking.bookingDate} formatString="dd MMM" />
                    </div>
                    <div className="text-[9px] text-muted-foreground flex items-center gap-1.5 font-black uppercase tracking-[0.2em] mt-0.5">
                      <Clock className="h-2.5 w-2.5 opacity-50" />
                      {booking.preferredTime}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                        <div className="space-y-0.5">
                             <BookingStatusBadge status={booking.status} className="text-[8px] font-black tracking-widest px-3 py-0.5 uppercase shadow-sm" />
                             <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest pr-1">Intake State</p>
                        </div>
                        <ChevronRight className={cn("h-4 w-4 text-muted-foreground/20 transition-all duration-300", isActive && "translate-x-1 text-primary opacity-100")} />
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