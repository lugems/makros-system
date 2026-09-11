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
import { Calendar, Clock, Wrench, Car, Hash, ChevronRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingsTableProps {
  bookings: Booking[];
  onSelect: (booking: Booking) => void;
  selectedId?: string | null;
}

/**
 * @fileOverview Technical registry table for service intakes.
 * Strict polymorphic resolution for Vehicle and Plant & Equipment assets.
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
    <div className="w-full">
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[750px]">
            <TableHeader>
              <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground border-none">
                <TableHead className="px-6 py-4">Client Identity & Reference</TableHead>
                <TableHead className="px-6 py-4">Asset Identity</TableHead>
                <TableHead className="px-6 py-4 text-center">Schedule</TableHead>
                <TableHead className="px-6 py-4 text-right">Registry Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const customer = customers?.find(c => (c.customerId === booking.customerId || (c as any).id === booking.customerId));
                
                // STRICT Polymorphic resolution
                const assetData = booking.assetType === 'Plant'
                    ? plants?.find(p => p.id === booking.vehicleId || p.assetId === booking.vehicleId)
                    : vehicles?.find(v => v.vehicleId === booking.vehicleId || (v as any).id === booking.vehicleId);

                const isPlant = booking.assetType === 'Plant';
                const isActive = selectedId === booking.bookingId;

                return (
                  <TableRow 
                    key={booking.bookingId} 
                    className={cn(
                        "cursor-pointer hover:bg-muted/30 transition-all group border-l-4 border-l-transparent",
                        isActive ? "bg-primary/5 border-l-primary" : "border-border/40"
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
                          <p className="text-sm font-black group-hover:text-primary transition-colors uppercase tracking-tight truncate max-w-[150px]">
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
                            {isPlant ? <Settings className="h-3.5 w-3.5 text-primary/50" /> : <Car className="h-3.5 w-3.5 text-primary/50" />}
                            <span className="truncate max-w-[150px]">
                                {isPlant ? ((assetData as any)?.name || 'Unit') : `${(assetData as any)?.make || ''} ${(assetData as any)?.model || ''}`.trim() || 'Asset'}
                            </span>
                        </div>
                        {assetData ? (
                          <p className="text-[10px] font-mono text-primary bg-primary/5 w-fit px-2 py-0.5 rounded font-black border border-primary/10 uppercase">
                              {(assetData as any)?.numberPlate || (assetData as any)?.assetId || 'ID'}
                          </p>
                        ) : (
                          <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Reference Pending</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center bg-muted/20 px-3 py-2 rounded-xl border border-transparent group-hover:border-primary/15 transition-all">
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
      </div>

      {/* Mobile Responsive Card List View */}
      <div className="space-y-3 md:hidden">
        {bookings.map((booking) => {
          const customer = customers?.find(c => (c.customerId === booking.customerId || (c as any).id === booking.customerId));
          
          const assetData = booking.assetType === 'Plant'
              ? plants?.find(p => p.id === booking.vehicleId || p.assetId === booking.vehicleId)
              : vehicles?.find(v => v.vehicleId === booking.vehicleId || (v as any).id === booking.vehicleId);

          const service = services?.find(s => (s.serviceId === booking.serviceId || (s as any).id === booking.serviceId));
          const isPlant = booking.assetType === 'Plant';
          const isActive = selectedId === booking.bookingId;

          return (
            <div
              key={booking.bookingId}
              onClick={() => onSelect(booking)}
              className={cn(
                "group relative overflow-hidden bg-card border rounded-2xl p-4 shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99] border-l-4",
                isActive ? "bg-primary/5 border-l-primary border-primary/40 shadow-md" : "border-border/60 border-l-transparent hover:border-primary/40"
              )}
            >
              {/* Header: Client & Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/5 shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-black uppercase">
                      {customer?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-black uppercase tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                      {customer?.fullName || 'Walk-in Client'}
                    </p>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Hash className="h-3 w-3 text-primary/50" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                        {booking.bookingId.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <BookingStatusBadge status={booking.status} className="text-[8px] px-2 py-0.5" />
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              </div>

              {/* Asset & Service Details */}
              <div className="mt-3 bg-muted/20 rounded-xl p-3 border border-border/40 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight text-foreground/90 truncate">
                    {isPlant ? <Settings className="h-3.5 w-3.5 text-primary/60 shrink-0" /> : <Car className="h-3.5 w-3.5 text-primary/60 shrink-0" />}
                    <span className="truncate">
                      {isPlant ? ((assetData as any)?.name || 'Plant Asset') : (assetData ? `${(assetData as any)?.make || ''} ${(assetData as any)?.model || ''}`.trim() : 'Vehicle Asset')}
                    </span>
                  </div>
                  {assetData && (
                    <span className="text-[9px] font-mono font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase shrink-0">
                      {(assetData as any)?.numberPlate || (assetData as any)?.assetId || 'ID'}
                    </span>
                  )}
                </div>

                {service && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide pt-1 border-t border-border/30">
                    <Wrench className="h-3 w-3 text-primary/50 shrink-0" />
                    <span className="truncate">{service.serviceName}</span>
                  </div>
                )}
              </div>

              {/* Schedule Details Footer */}
              <div className="flex items-center justify-between mt-3 px-1 text-[10px]">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <FormattedDate date={booking.bookingDate} formatString="dd MMM yyyy" />
                </div>
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{booking.preferredTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
