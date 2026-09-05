'use client';

import React, { useMemo } from 'react';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/types/booking';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { PlantEquipment } from '@/types/plant-equipment';
import { MakrosService } from '@/types/makros-service';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { FormattedDate } from '@/components/shared/formatted-date';
import { BookingStatusBadge } from './booking-status-badge';
import { Clock, Users, Car, ChevronRight, Hash, Sparkles, LayoutGrid, Hammer, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  bookings: Booking[];
  onSelect: (booking: Booking) => void;
}

/**
 * @fileOverview Technical Master Calendar for Workshop Intakes.
 * Recalibrated for Polymorphic Asset support (Vehicles vs Plant).
 */
export function BookingCalendar({ bookings, onSelect }: BookingCalendarProps) {
  const db = useFirestore();
  
  // Real-time Technical Context (Stabilized)
  const custQuery = useMemoFirebase(() => query(collection(db, 'customers')), [db]);
  const vehQuery = useMemoFirebase(() => query(collection(db, 'vehicles')), [db]);
  const plantQuery = useMemoFirebase(() => query(collection(db, 'plantsAndEquipment')), [db]);
  const srvQuery = useMemoFirebase(() => query(collection(db, 'services')), [db]);

  const { data: customers } = useCollection<Customer>(custQuery as any);
  const { data: vehicles } = useCollection<Vehicle>(vehQuery as any);
  const { data: plants } = useCollection<PlantEquipment>(plantQuery as any);
  const { data: services } = useCollection<MakrosService>(srvQuery as any);

  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const bookingsForSelectedDate = React.useMemo(() => {
    if (!date) return [];
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const selectedDateStr = `${y}-${m}-${d}`;
    
    return bookings.filter(b => b.bookingDate === selectedDateStr);
  }, [bookings, date]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border/50 rounded-[2.5rem] p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                    <CalendarDays className="h-32 w-32" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-2 relative z-10">
                    <Hash className="h-3 w-3 text-primary" /> Technical Master Calendar
                </h4>
                <div className="relative z-10">
                    <CalendarUI
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="p-0 pointer-events-auto"
                    />
                </div>
            </div>
            
            <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 relative overflow-hidden group">
                <Sparkles className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> Workshop Intelligence
                </h4>
                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
                    {bookingsForSelectedDate.length > 5 
                        ? "Peak bay utilization alert. High intake volume detected. Prioritize rapid-turnover maintenance tasks to maintain flow."
                        : bookingsForSelectedDate.length > 0 
                            ? "Optimal load detected. Ensure all technical dossiers are pre-initialized before client arrival."
                            : "Facility window available. Recommended for complex diagnostics or internal equipment calibration cycles."
                    }
                </p>
            </div>
        </div>
        
        <Card className="lg:col-span-8 border-border/50 bg-card shadow-sm rounded-[2.5rem] overflow-hidden min-h-[600px] flex flex-col premium-shadow">
            <div className="bg-muted/30 px-8 py-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-sm">
                        <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">
                            Agenda: {date ? <FormattedDate date={date} formatString="dd MMMM yyyy" /> : 'Interval Logic'}
                        </h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-0.5">Technician Intake Hierarchy</p>
                    </div>
                </div>
                <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-widest px-5 py-2 rounded-xl bg-primary/10 text-primary border-none shadow-sm h-fit">
                    {bookingsForSelectedDate.length} Service Trace{bookingsForSelectedDate.length !== 1 && 's'}
                </Badge>
            </div>
            
            <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="h-full p-8 space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
                    {bookingsForSelectedDate.length > 0 ? (
                        bookingsForSelectedDate
                            .sort((a, b) => a.preferredTime.localeCompare(b.preferredTime))
                            .map(booking => {
                                const customer = customers?.find(c => (c.customerId === booking.customerId || (c as any).id === booking.customerId));
                                const service = services?.find(s => (s.serviceId === booking.serviceId || (s as any).id === booking.serviceId));
                                
                                // Polymorphic Asset Resolution
                                const assetType = booking.assetType || 'Vehicle';
                                const assetId = booking.assetId || booking.vehicleId;
                                
                                let assetLabel = 'Registry Trace...';
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
                                    <div 
                                        key={booking.bookingId}
                                        onClick={() => onSelect(booking)}
                                        className="group relative flex items-center justify-between p-6 rounded-3xl border border-border/50 hover:border-primary/40 hover:bg-primary/[0.01] cursor-pointer transition-all duration-300 hover:translate-x-1"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className="flex flex-col items-center justify-center border-r border-border/50 pr-8 min-w-[110px]">
                                                <span className="text-3xl font-black text-primary leading-none group-hover:scale-110 transition-transform tabular-nums">
                                                    {booking.preferredTime}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">Arrival Win</span>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <p className="font-black text-base uppercase tracking-tight group-hover:text-primary transition-colors">
                                                        {customer?.fullName || 'Walk-in Client'}
                                                    </p>
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase py-0.5 px-2 border-primary/20 text-primary bg-primary/5">
                                                        #{booking.bookingId.slice(-4).toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                                        {assetType === 'Vehicle' ? <Car className="h-3.5 w-3.5 opacity-50" /> : <Hammer className="h-3.5 w-3.5 opacity-50" />}
                                                        {assetLabel}
                                                    </div>
                                                    <span className="text-border opacity-30">/</span>
                                                    <div className="flex items-center gap-2 text-[10px] font-mono font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase">
                                                        {assetRef}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pt-1">
                                                    <Badge className="bg-indigo-500/10 text-indigo-600 border-none hover:bg-indigo-500/10 h-5 text-[8px] font-black px-2 uppercase">
                                                        {service?.serviceName || 'Standard Repair'}
                                                    </Badge>
                                                    {booking.assignedMechanicId && (
                                                        <>
                                                            <span className="opacity-30">•</span>
                                                            <span className="italic flex items-center gap-1.5"><Users className="h-3 w-3" /> {booking.assignedMechanicId.slice(-6).toUpperCase()}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            <div className="hidden sm:block">
                                                <BookingStatusBadge status={booking.status} className="text-[8px] font-black uppercase tracking-widest px-4 py-1 shadow-sm" />
                                            </div>
                                            <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-muted/50 border border-transparent group-hover:border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                                                <ChevronRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                        
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-12 bg-primary rounded-r-full transition-all duration-300" />
                                    </div>
                                );
                            })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-[3rem] bg-muted/5 text-muted-foreground text-center animate-in fade-in zoom-in-95 duration-700">
                            <div className="h-24 w-24 rounded-[2.5rem] bg-background border border-border/50 flex items-center justify-center mb-8 shadow-xl ring-1 ring-border group hover:rotate-6 transition-all">
                                <LayoutGrid className="h-10 w-10 opacity-10 group-hover:opacity-100 group-hover:text-primary transition-all duration-500" />
                            </div>
                            <h4 className="text-lg font-black uppercase tracking-[0.4em] opacity-50 mb-3 leading-none">Facility Interval</h4>
                            <p className="text-sm font-medium italic opacity-40 max-w-xs mx-auto leading-relaxed">
                                No technical appointments scheduled for this date interval. Perfect window for workshop audits or system maintenance cycles.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
