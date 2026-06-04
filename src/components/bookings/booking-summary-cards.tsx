'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types/booking';
import { Calendar, Clock, CheckCircle2, AlertCircle, ClipboardList, Ban, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingSummaryCardsProps {
  bookings: Booking[];
}

export function BookingSummaryCards({ bookings }: BookingSummaryCardsProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const stats = {
    total: bookings.length,
    today: bookings.filter(b => b.bookingDate === today).length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    checkedIn: bookings.filter(b => b.status === 'Checked In').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };

  const cards = [
    { title: 'Total Volume', value: stats.total, icon: <Activity className="h-4 w-4" />, color: 'bg-primary/10 text-primary', gradient: 'from-primary/5 to-transparent' },
    { title: "Today's Window", value: stats.today, icon: <Calendar className="h-4 w-4" />, color: 'bg-indigo-500/10 text-indigo-500', gradient: 'from-indigo-500/5 to-transparent' },
    { title: 'Awaiting', value: stats.pending, icon: <Clock className="h-4 w-4" />, color: 'bg-amber-500/10 text-amber-500', gradient: 'from-amber-500/5 to-transparent' },
    { title: 'Confirmed', value: stats.confirmed, icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-500/10 text-green-600', gradient: 'from-green-500/5 to-transparent' },
    { title: 'Checked In', value: stats.checkedIn, icon: <AlertCircle className="h-4 w-4" />, color: 'bg-purple-500/10 text-purple-500', gradient: 'from-purple-500/5 to-transparent' },
    { title: 'Void Cycle', value: stats.cancelled, icon: <Ban className="h-4 w-4" />, color: 'bg-red-500/10 text-red-500', gradient: 'from-red-500/5 to-transparent' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={cn("bg-card border-border/50 relative overflow-hidden group hover:border-primary/30 transition-all duration-500 rounded-2xl shadow-sm")}>
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", card.gradient)} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5 relative z-10">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{card.title}</CardTitle>
            <div className={cn("p-2 rounded-xl transition-all group-hover:scale-110 group-hover:rotate-6 duration-300", card.color)}>
                {card.icon}
            </div>
          </CardHeader>
          <CardContent className="relative z-10 px-5 pb-5 pt-0">
            <div className="text-3xl font-black tracking-tighter">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}