'use client';

import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import { FormattedDate } from '@/components/shared/formatted-date';
import { 
    Calendar, 
    Plus, 
    Clock, 
    Car, 
    Wrench, 
    ArrowRight,
    History,
    ShieldCheck,
    AlertCircle,
    Loader2,
    Hash,
    Info,
    FileText,
    XCircle,
    ChevronRight,
    Fingerprint
} from 'lucide-react';
import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
import { Separator } from '@/components/ui/separator';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogBody,
    DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createBooking, updateBookingStatus } from '@/services/bookings-service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Client-side Service Queue for customers.
 * Uses useMemoFirebase to stabilize ownership-gated booking queries.
 */
export default function CustomerBookingsPage() {
    const { user } = useAuth();
    const db = useFirestore();
    const { toast } = useToast();

    // Technical Streams (Stabilized)
    const bookingsQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(
            collection(db, 'bookings'), 
            where('customerId', '==', user.userId),
            orderBy('bookingDate', 'desc')
        );
    }, [db, user?.userId]);

    const vehQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(collection(db, 'vehicles'), where('customerId', '==', user.userId));
    }, [db, user?.userId]);

    const srvQuery = useMemoFirebase(() => {
        if (!db) return null;
        return query(collection(db, 'services'), where('status', '==', 'Active'), orderBy('serviceName', 'asc'));
    }, [db]);

    const { data: bookings, loading: bLoading } = useCollection<any>(bookingsQuery);
    const { data: vehicles } = useCollection<any>(vehQuery);
    const { data: services } = useCollection<any>(srvQuery);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isCancelLoading, setIsCancelLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        vehicleId: '',
        serviceId: '',
        bookingDate: new Date().toISOString().split('T')[0],
        preferredTime: '09:00',
        notes: ''
    });

    const activeBookings = bookings?.filter(b => ['Pending', 'Confirmed', 'Checked In'].includes(b.status)) || [];
    const pastBookings = bookings?.filter(b => !['Pending', 'Confirmed', 'Checked In'].includes(b.status)) || [];

    const handleScheduleService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formData.vehicleId || !formData.serviceId) return;

        setIsSubmitting(true);
        try {
            createBooking({
                customerId: user.userId,
                vehicleId: formData.vehicleId,
                serviceId: formData.serviceId,
                bookingDate: formData.bookingDate,
                preferredTime: formData.preferredTime,
                status: 'Pending',
                notes: formData.notes
            }, user.userId);

            toast({ title: "Appointment Scheduled", description: "Your service request has been queued for workshop review." });
            setIsDialogOpen(false);
            setFormData({
                vehicleId: '',
                serviceId: '',
                bookingDate: new Date().toISOString().split('T')[0],
                preferredTime: '09:00',
                notes: ''
            });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Schedule Failed", description: error.message || "Registry synchronization error." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        if (!user) return;
        setIsCancelLoading(true);
        try {
            await updateBookingStatus(bookingId, 'Cancelled', user.userId);
            toast({ title: "Appointment Cancelled", description: "Your service window has been decommissioned." });
            setSelectedBooking(null);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Operation Failed", description: "Technical error during cancellation protocol." });
        } finally {
            setIsCancelLoading(false);
        }
    };

    if (bLoading) return <LoadingState />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-headline">My Appointments</h1>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Schedule & Maintenance Queue</p>
                </div>
                <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="h-12 px-8 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 gap-3"
                >
                    <Plus className="h-4 w-4" /> Schedule Service
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* Active Queue */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-muted-foreground px-2">
                            <Clock className="h-4 w-4" />
                            <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Upcoming Service windows</h3>
                        </div>
                        
                        <div className="grid gap-4">
                            {activeBookings.map(booking => (
                                <Card key={booking.bookingId} className="rounded-3xl border-border/50 bg-card hover:border-primary/40 transition-all overflow-hidden group shadow-sm">
                                    <CardContent className="p-0 flex flex-col sm:flex-row">
                                        <div className="bg-primary/5 sm:w-48 p-8 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-border/50 group-hover:bg-primary/10 transition-colors">
                                            <span className="text-3xl font-black text-primary leading-none">
                                                <FormattedDate date={booking.bookingDate} formatString="dd" />
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2">
                                                <FormattedDate date={booking.bookingDate} formatString="MMMM" />
                                            </span>
                                        </div>
                                        <div className="flex-1 p-8 flex flex-col sm:flex-row justify-between items-center gap-8">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 text-primary bg-primary/5">
                                                        #{booking.bookingId.slice(-4).toUpperCase()}
                                                    </Badge>
                                                    <BookingStatusBadge status={booking.status} className="text-[8px]" />
                                                </div>
                                                <p className="text-xl font-black uppercase tracking-tight">Technical Intake @ {booking.preferredTime}</p>
                                                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Car className="h-3.5 w-3.5 opacity-40" /> {vehicles?.find((v: any) => (v.id === booking.vehicleId || v.vehicleId === booking.vehicleId))?.numberPlate || 'Unit Reference'}</span>
                                                    <span className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5 opacity-40" /> {services?.find((s: any) => (s.id === booking.serviceId || s.serviceId === booking.serviceId))?.serviceName || 'Standard'}</span>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setSelectedBooking(booking)}
                                                className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest bg-background hover:bg-primary hover:text-white transition-all border-border/50"
                                            >
                                                Manage Window
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {activeBookings.length === 0 && (
                                <div className="py-20 text-center border-2 border-dashed rounded-[2.5rem] opacity-30 flex flex-col items-center justify-center space-y-4 bg-muted/5">
                                    <Calendar className="h-12 w-12" />
                                    <p className="text-sm font-medium italic">No upcoming appointments detected in your queue.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Historical Traces */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-muted-foreground px-2">
                            <History className="h-4 w-4" />
                            <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Service Interaction log</h3>
                        </div>
                        
                        <div className="bg-muted/10 rounded-[2.5rem] border border-border/50 overflow-hidden">
                            {pastBookings.length > 0 ? (
                                <div className="divide-y divide-border/50">
                                    {pastBookings.map(booking => (
                                        <div key={booking.bookingId} className="p-6 flex items-center justify-between hover:bg-muted/20 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                    <History className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-tight">Dossier Closure: <FormattedDate date={booking.bookingDate} formatString="dd MMM yyyy" /></p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Ref: {booking.bookingId.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase opacity-60 px-3 py-1 rounded-lg">{booking.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center opacity-30">
                                    <p className="text-xs font-medium italic">No historical traces found in the registry.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Technical Protocol
                        </h4>
                        <div className="space-y-4 relative z-10">
                            <p className="text-[11px] font-medium leading-relaxed italic text-white/70">
                                Appointments ensure a technical bay is reserved for your vehicle. Arriving on time minimizes operational downtime for your unit.
                            </p>
                            <Separator className="bg-white/10" />
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                    Cancellations require a 24-hour advance notice to clear the technical schedule for other units.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <Card className="p-8 rounded-[2.5rem] border border-border/50 bg-card shadow-sm flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-muted flex items-center justify-center">
                            <Calendar className="h-8 w-8 opacity-20" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Certified Schedule Active</h4>
                    </Card>
                </div>
            </div>

            {/* Schedule Service Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
                    <DialogHeader className="px-6 pt-6 pb-2 text-left">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Schedule Technical Intake</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Reserve a workshop slot for your vehicle maintenance.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleScheduleService} className="flex min-h-0 flex-1 flex-col">
                        <DialogBody>
                            <div className="space-y-6 px-6 pb-6 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Car className="h-3 w-3 text-primary" /> Select Your Asset
                                    </Label>
                                    <Select 
                                        value={formData.vehicleId} 
                                        onValueChange={(val) => setFormData({ ...formData, vehicleId: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold">
                                            <SelectValue placeholder="Identify vehicle..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50">
                                            {vehicles?.map(v => (
                                                <SelectItem key={v.vehicleId || v.id} value={v.vehicleId || v.id} className="font-bold text-xs uppercase">
                                                    {v.make} {v.model} ({v.numberPlate})
                                                </SelectItem>
                                            ))}
                                            {(!vehicles || vehicles.length === 0) && <SelectItem value="none" disabled>No units registered</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Wrench className="h-3 w-3 text-primary" /> Desired Service
                                    </Label>
                                    <Select 
                                        value={formData.serviceId} 
                                        onValueChange={(val) => setFormData({ ...formData, serviceId: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold">
                                            <SelectValue placeholder="Identify service category..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50">
                                            {services?.map(s => (
                                                <SelectItem key={s.serviceId || s.id} value={s.serviceId || s.id} className="font-bold text-xs uppercase">
                                                    {s.serviceName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-primary" /> Desired Date
                                        </Label>
                                        <Input 
                                            type="date" 
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.bookingDate}
                                            onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                                            className="rounded-xl h-12 bg-muted/50 border-none font-bold text-center" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-primary" /> Arrival Window
                                        </Label>
                                        <Input 
                                            type="time" 
                                            value={formData.preferredTime}
                                            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                            className="rounded-xl h-12 bg-muted/50 border-none font-bold text-center" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <FileText className="h-3 w-3 text-primary" /> Additional Observations
                                    </Label>
                                    <Textarea 
                                        placeholder="Describe symptoms or specific maintenance requirements..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="min-h-[100px] rounded-2xl bg-muted/30 border-none resize-none p-4 text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </DialogBody>

                        <DialogFooter className="p-6 border-t">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !formData.vehicleId || !formData.serviceId}
                                className="w-full h-14 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] text-[11px]"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <><Plus className="h-4 w-4 mr-2" /> Request Intake</>}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Manage Appointment Dialog */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50 rounded-3xl bg-background shadow-2xl">
                    <DialogHeader className="px-8 pt-8 pb-4 text-left border-b bg-muted/30">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                                <Info className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">Manage Intake</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">Technical window review and decommissioning protocols.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <DialogBody>
                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Fingerprint className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest">#{selectedBooking?.bookingId.toUpperCase().slice(-8)}</span>
                                    </div>
                                    <p className="text-lg font-black uppercase tracking-tight">Active Appointment</p>
                                </div>
                                <BookingStatusBadge status={selectedBooking?.status} className="h-7 px-4 shadow-sm border-none" />
                            </div>

                            <Separator className="opacity-50" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                        <Calendar className="h-2.5 w-2.5" /> Date
                                    </p>
                                    <p className="text-sm font-black uppercase">{selectedBooking ? <FormattedDate date={selectedBooking.bookingDate} formatString="dd MMM yyyy" /> : ''}</p>
                                </div>
                                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                        <Clock className="h-2.5 w-2.5" /> Window
                                    </p>
                                    <p className="text-sm font-black uppercase">{selectedBooking?.preferredTime}</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border border-border/50">
                                        <Car className="h-4 w-4" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Unit Identity</h4>
                                </div>
                                <div className="pl-10">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-base font-black uppercase tracking-tight">
                                            {vehicles?.find((v: any) => (v.id === selectedBooking?.vehicleId || v.vehicleId === selectedBooking?.vehicleId))?.make} 
                                            {" "}
                                            {vehicles?.find((v: any) => (v.id === selectedBooking?.vehicleId || v.vehicleId === selectedBooking?.vehicleId))?.model}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-mono font-black text-primary bg-primary/5 border-primary/20">
                                        {vehicles?.find((v: any) => (v.id === selectedBooking?.vehicleId || v.vehicleId === selectedBooking?.vehicleId))?.numberPlate}
                                    </Badge>
                                </div>
                            </div>

                            {selectedBooking?.notes && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border border-border/50">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Symptoms Log</h4>
                                    </div>
                                    <div className="pl-10">
                                        <div className="bg-muted/10 p-4 rounded-xl border border-dashed border-border/50">
                                            <p className="text-[11px] italic font-medium leading-relaxed text-muted-foreground/80">&quot;{selectedBooking.notes}&quot;</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-start gap-4">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground">
                                    Your technician bay is currently reserved. Cancelling allows us to optimize the workshop load for other clients.
                                </p>
                            </div>
                        </div>
                    </DialogBody>

                    <DialogFooter className="p-8 border-t flex flex-col sm:flex-row gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => setSelectedBooking(null)}
                            className="flex-1 h-12 font-black uppercase tracking-widest text-[10px] rounded-xl"
                        >
                            Keep Appointment
                        </Button>
                        <Button 
                            variant="ghost" 
                            disabled={isCancelLoading || selectedBooking?.status === 'Checked In'}
                            onClick={() => handleCancelBooking(selectedBooking.bookingId)}
                            className="flex-1 h-12 font-black uppercase tracking-widest text-[10px] text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                            {isCancelLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Cancel Intake
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <footer className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center rounded-[2.5rem]">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.6em]">Makros System Client Portal • Authorized Access Certified</p>
            </footer>
        </div>
    );
}
