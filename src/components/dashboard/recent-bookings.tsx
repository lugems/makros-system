'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ChevronRight, Fingerprint, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Booking } from '@/types/booking';
import useMakrosStore from '@/store/makros-store';
import { FormattedDate } from '@/components/shared/formatted-date';

interface RecentBookingsProps {
  bookings: Booking[];
}

export const RecentBookings: React.FC<RecentBookingsProps> = ({ bookings }) => {
  const router = useRouter();
  const { customers, services } = useMakrosStore();

  return (
    <div className="divide-y divide-border/40">
      {bookings.length > 0 ? bookings.map((booking) => {
        const customer = customers.find(c => c.customerId === booking.customerId);
        const service = services.find(s => s.serviceId === booking.serviceId);

        return (
          <div 
            key={booking.bookingId} 
            className="flex items-center justify-between p-5 hover:bg-muted/10 transition-colors group cursor-pointer"
            onClick={() => router.push(`/bookings/${booking.bookingId}`)}
          >
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                    {customer?.fullName || 'Walk-in Client'}
                  </p>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted border border-border/50">
                    <Fingerprint className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase">{booking.bookingId.slice(-4)}</span>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{service?.serviceName || 'General Service'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-black text-foreground">{booking.preferredTime}</p>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-tighter">
                  <FormattedDate date={booking.bookingDate} formatString="dd MMM" />
                </p>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
          </div>
        );
      }) : (
        <div className="p-10 text-center opacity-30">
          <Calendar className="h-8 w-8 mx-auto mb-2" />
          <p className="text-[9px] font-black uppercase tracking-widest">Queue Empty</p>
        </div>
      )}
      <div className="p-4 bg-muted/5 text-center">
        <button 
            onClick={() => router.push('/bookings')}
            className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
        >
          View All Appointments
        </button>
      </div>
    </div>
  );
};