'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Booking } from '@/types/booking';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { PlantEquipment } from '@/types/plant-equipment';
import { MakrosService } from '@/types/makros-service';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { BookingStatusBadge } from './booking-status-badge';
import { Calendar, Clock, User, ArrowRight, Wrench, Car, Fingerprint, Hammer } from 'lucide-react';
import { FormattedDate } from '@/components/shared/formatted-date';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/loading-state';

interface BookingCardProps {
  booking: Booking;
  onSelect: (booking: Booking) => void;
}

/**
 * @fileOverview High-density Intake Card with real-time polymorphic asset resolution.
 */
export function BookingCard({ booking, onSelect }: BookingCardProps) {
  const db = useFirestore();

  // Real-time Technical Lookups
  const custRef = useMemoFirebase(() => doc(db, 'customers', booking.customerId), [db, booking.customerId]);
  const srvRef = useMemoFirebase(() => doc(db, 'services', booking.serviceId), [db, booking.serviceId]);
  
  const assetType = booking.assetType || 'Vehicle';
  const assetId = booking.assetId || booking.vehicleId;
  const col = assetType === 'Vehicle' ? 'vehicles' : 'plantsAndEquipment';
  const assetRef = useMemoFirebase(() => assetId ? doc(db, col, assetId) : null, [db, col, assetId]);

  const { data: customer } = useDoc<Customer>(custRef as any);
  const { data: asset } = useDoc<any>(assetRef as any);
  const { data: service } = useDoc<MakrosService>(srvRef as any);

  // Asset Display Logic
  const isVehicle = assetType === 'Vehicle';
  const name = isVehicle ? `${asset?.make || ''} ${asset?.model || ''}` : (asset?.name || 'Unit Trace...');
  const refLabel = isVehicle ? asset?.numberPlate : asset?.assetId;

  return (
    <Card 
        className="cursor-pointer group hover:border-primary/40 transition-all duration-300 bg-card border-border/50 rounded-[1.75rem] shadow-sm flex flex-col h-full overflow-hidden"
        onClick={() => onSelect(booking)}
    >
      <CardHeader className="pb-3 p-5">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5">
                <Fingerprint className="h-3 w-3 text-primary/50" />
                <span className="text-[9px] font-mono font-black uppercase text-muted-foreground tracking-widest">
                    #{booking.bookingId.slice(-4).toUpperCase()}
                </span>
            </div>
            <BookingStatusBadge status={booking.status} className="text-[8px] px-2 py-0.5" />
        </div>
        <CardTitle className="text-sm font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {customer?.fullName || 'Walk-in Client'}
        </CardTitle>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 pt-0.5">
          <Wrench className="h-3 w-3 text-primary/50" />
          {service?.serviceName || 'General Service'}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 px-5 flex-1">
        <div className="bg-muted/30 p-3 rounded-2xl border border-dashed border-border/50">
            <div className="flex items-center gap-2 mb-2">
                {isVehicle ? <Car className="h-3.5 w-3.5 text-primary/50" /> : <Hammer className="h-3.5 w-3.5 text-primary/50" />}
                <span className="text-[11px] font-black uppercase tracking-tight text-foreground/80 truncate">
                    {name}
                </span>
            </div>
            <p className="text-[9px] font-mono font-black text-primary bg-primary/5 w-fit px-2 py-0.5 rounded border border-primary/10 uppercase">
                {refLabel || 'NO_REF'}
            </p>
        </div>

        <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground"><FormattedDate date={booking.bookingDate} formatString="dd MMM" /></p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none">Temporal Ref</p>
                </div>
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 text-[10px] font-black uppercase text-primary">
                    <Clock className="h-3 w-3" />
                    {booking.preferredTime}
                </div>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Arrival window</p>
            </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0">
        <Button variant="outline" size="sm" className="w-full h-9 text-[9px] font-black uppercase tracking-widest gap-2 bg-background rounded-xl border-border/50 group-hover:bg-primary group-hover:text-white transition-all">
          Inspect Dossier
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardFooter>
      
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
    </Card>
  );
}
