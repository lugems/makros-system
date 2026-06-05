'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { Booking, BookingStatus } from '@/types/booking';
import { LoadingState } from '@/components/shared/loading-state';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Fingerprint, ShieldCheck } from 'lucide-react';
import { BookingDetails } from './booking-details';
import { useToast } from '@/hooks/use-toast';
import { updateBookingStatus } from '@/services/bookings-service';
import { useAuth } from '@/contexts/auth-context';

interface BookingDetailsPageProps {
  params: { bookingId: string };
}

/**
 * @fileOverview High-fidelity Standalone Dossier Terminal for Service Bookings.
 * Synchronizes with real-time registry data and provides deep workflow interaction.
 */
const BookingDetailsPage = ({ params }: BookingDetailsPageProps) => {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { bookingId } = params;

  // Real-time Technical Stream (Stabilized)
  const bookingRef = useMemoFirebase(() => {
    if (!db || !bookingId) return null;
    return doc(db, 'bookings', bookingId) as DocumentReference<Booking>;
  }, [db, bookingId]);

  const { data: booking, loading } = useDoc<Booking>(bookingRef);

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    if (!currentUser) return;
    try {
      await updateBookingStatus(id, status, currentUser.userId);
      toast({ title: "Status Synchronized", description: `Appointment marked as ${status} in master registry.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Technical error during state transition." });
    }
  };

  const handleConvertToJobCard = (b: Booking) => {
    router.push(`/job-cards/new?bookingId=${b.bookingId}`);
  };

  if (loading) return <LoadingState />;

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
        <div className="h-20 w-20 rounded-[2.5rem] bg-muted flex items-center justify-center border border-border/50 shadow-sm">
            <Calendar className="h-10 w-10 opacity-20" />
        </div>
        <div className="text-center space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tight">Appointment Not Located</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                The requested service intake dossier could not be retrieved from the active queue.
            </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/bookings')} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8 gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
            <Button variant="ghost" size="icon" onClick={() => router.push('/bookings')} className="h-12 w-12 rounded-2xl hover:bg-muted border border-border/50">
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-headline">Intake Dossier</h1>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Registry Sync Active</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <Fingerprint className="h-3 w-3 text-muted-foreground/40" />
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-60">
                        {booking.bookingId.toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-muted/30 border border-border/50">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Certified Document Analysis</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 h-full">
            <BookingDetails 
                booking={booking}
                onClose={() => router.push('/bookings')}
                onStatusChange={handleStatusChange}
                onConvertToJobCard={handleConvertToJobCard}
                onEdit={() => {}} // Logic handled within specialized component tabs/dialogs if needed
            />
          </div>
          
          <div className="lg:col-span-4 space-y-8">
              <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Technical Assurance
                  </h4>
                  <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
                      Scheduled intakes are prioritized for bay allocation. Personnel assignments ensure specialized diagnostic precision for this repair cycle.
                  </p>
              </div>

              <Card className="rounded-[2.5rem] border-border/50 bg-slate-900 text-white p-8 shadow-2xl relative overflow-hidden border-none group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 transition-transform group-hover:rotate-45 duration-700">
                      <Calendar className="h-40 w-40" />
                  </div>
                  <div className="relative z-10 space-y-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Temporal Sync</p>
                        <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Target Arrival Window</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-black text-white">{booking.preferredTime}</p>
                        <p className="text-lg font-black text-primary uppercase tracking-tighter"><FormattedDate date={booking.bookingDate} formatString="dd MMMM yyyy" /></p>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex items-center justify-between pt-2">
                          <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em]">Registry State</span>
                          <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] uppercase px-4">{booking.status}</Badge>
                      </div>
                  </div>
              </Card>
          </div>
      </div>

      <footer className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center rounded-[2.5rem]">
          <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.6em] text-center">Makros System Technical Intake • Internal Reference Classified</p>
      </footer>
    </div>
  );
};

export default BookingDetailsPage;
