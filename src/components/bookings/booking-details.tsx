'use client';

import React, { useState } from 'react';
import { Booking } from '@/types/booking';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { MakrosService } from '@/types/makros-service';
import { StaffMember } from '@/types/staff';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormattedDate } from '@/components/shared/formatted-date';
import { BookingStatusBadge } from './booking-status-badge';
import { canMoveBookingStatus } from '@/lib/booking-workflow';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelatedCommunications } from '@/components/communications/related-communications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CommunicationForm } from '@/components/communications/communication-form';
import { createCommunicationLog } from '@/services/communications-service';
import { useToast } from '@/hooks/use-toast';
import { 
    User, 
    Car, 
    Wrench, 
    Phone, 
    Mail, 
    MessageSquare, 
    ClipboardPlus,
    XCircle,
    UserCheck,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Fingerprint,
    Edit,
    Calendar,
    Clock,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingDetailsProps {
  booking: Booking;
  onClose: () => void;
  onStatusChange: (id: string, status: Booking['status']) => void;
  onConvertToJobCard: (booking: Booking) => void;
  onEdit: () => void;
}

export function BookingDetails({ booking, onClose, onStatusChange, onConvertToJobCard, onEdit }: BookingDetailsProps) {
    const db = useFirestore();
    const { toast } = useToast();
    
    // Stabilized document references with explicit guards to prevent runtime crashes
    const custRef = useMemoFirebase(() => {
        if (!db || !booking?.customerId) return null;
        return doc(db, 'customers', booking.customerId);
    }, [db, booking?.customerId]);

    const vehRef = useMemoFirebase(() => {
        if (!db || !booking?.vehicleId) return null;
        return doc(db, 'vehicles', booking.vehicleId);
    }, [db, booking?.vehicleId]);

    const srvRef = useMemoFirebase(() => {
        if (!db || !booking?.serviceId) return null;
        return doc(db, 'services', booking.serviceId);
    }, [db, booking?.serviceId]);

    const mechRef = useMemoFirebase(() => {
        if (!db || !booking?.assignedMechanicId || booking.assignedMechanicId === 'unassigned') return null;
        return doc(db, 'users', booking.assignedMechanicId);
    }, [db, booking?.assignedMechanicId]);

    const { data: customer } = useDoc<Customer>(custRef as any);
    const { data: vehicle } = useDoc<Vehicle>(vehRef as any);
    const { data: service } = useDoc<MakrosService>(srvRef as any);
    const { data: mechanic } = useDoc<StaffMember>(mechRef as any);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAction = (status: Booking['status']) => {
        onStatusChange(booking.bookingId, status);
    };

    const handleLogInteraction = async (data: any) => {
        if (!customer) return;
        setIsSubmitting(true);
        try {
            await createCommunicationLog({
                ...data,
                bookingId: booking.bookingId,
                customerId: booking.customerId,
                vehicleId: booking.vehicleId,
                toName: customer.fullName,
                toRole: 'Customer'
            }, booking.bookingId); // Logic captures current user correctly in service
            setIsFormOpen(false);
            toast({ title: "Interaction Logged", description: "Technical trace registered for this intake." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Operation Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="h-full border-border/50 bg-card shadow-2xl flex flex-col overflow-hidden text-foreground rounded-[2.5rem] premium-shadow animate-in slide-in-from-right-4 duration-500">
            <CardHeader className="bg-muted/30 p-8 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden -ml-4 h-10 w-10 rounded-full hover:bg-background">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="h-3.5 w-3.5 text-primary" />
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">{booking.bookingId.slice(-8).toUpperCase()}</p>
                        </div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight leading-none">Intake Dossier</CardTitle>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onEdit} className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary border border-primary/20">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <BookingStatusBadge status={booking.status} className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 shadow-md border-none" />
                </div>
            </CardHeader>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                <div className="bg-card border-b border-border/50 p-1.5 shadow-sm overflow-x-auto custom-scrollbar no-print shrink-0">
                    <TabsList className="bg-transparent h-auto gap-1 p-0 flex justify-start w-full min-w-max">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-8 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Technical Overview</TabsTrigger>
                        <TabsTrigger value="communication" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-8 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Interaction Log</TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1">
                    <TabsContent value="overview" className="m-0 focus-visible:outline-none animate-in fade-in duration-500">
                        <CardContent className="p-8 space-y-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-primary/5 p-5 rounded-[1.75rem] border border-primary/10 text-center relative overflow-hidden group">
                                    <Calendar className="absolute -right-2 -bottom-2 h-12 w-12 text-primary/5 group-hover:scale-110 transition-transform" />
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1.5 relative z-10">Intake Schedule</p>
                                    <p className="text-base font-black relative z-10"><FormattedDate date={booking.bookingDate} formatString="dd MMM yyyy" /></p>
                                </div>
                                <div className="bg-indigo-500/5 p-5 rounded-[1.75rem] border border-indigo-500/10 text-center relative overflow-hidden group">
                                    <Clock className="absolute -right-2 -bottom-2 h-12 w-12 text-indigo-500/5 group-hover:scale-110 transition-transform" />
                                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1.5 relative z-10">Arrival Window</p>
                                    <p className="text-base font-black relative z-10">{booking.preferredTime}</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border border-border/50">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Account Holder</h3>
                                </div>
                                <div className="pl-9 space-y-4">
                                    <div>
                                        <p className="font-black text-lg leading-none uppercase tracking-tight text-foreground">{customer?.fullName || 'Registry Void'}</p>
                                        <p className="text-[11px] text-muted-foreground mt-2 font-medium leading-relaxed italic">{customer?.address || 'Physical address record pending sync.'}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Badge variant="secondary" className="gap-2 px-4 py-1.5 text-[10px] font-bold rounded-xl bg-muted/50 border-none"><Phone className="h-3 w-3 opacity-60" /> {customer?.phone}</Badge>
                                        {customer?.email && (
                                            <Badge variant="secondary" className="gap-2 px-4 py-1.5 text-[10px] font-bold rounded-xl bg-muted/50 border-none truncate max-w-[200px]">
                                                <Mail className="h-3 w-3 opacity-60" /> {customer.email}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator className="opacity-50" />

                            <div className="space-y-5">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border border-border/50">
                                        <Car className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Technical Asset</h3>
                                </div>
                                <div className="pl-9 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <p className="font-black text-lg uppercase tracking-tight text-foreground">{vehicle?.make} {vehicle?.model}</p>
                                        <Badge variant="outline" className="text-[10px] font-mono font-black border-primary/20 text-primary bg-primary/5 h-6">
                                            {vehicle?.year || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-xs font-mono bg-primary text-primary-foreground px-3 py-1 rounded-xl font-black uppercase shadow-lg shadow-primary/20">
                                            {vehicle?.numberPlate}
                                        </p>
                                        <Separator orientation="vertical" className="h-4 opacity-30" />
                                        <p className="text-[9px] font-mono text-muted-foreground font-black uppercase tracking-widest">VIN: {vehicle?.vin?.slice(-12).toUpperCase() || 'UNIT_TBD'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="opacity-50" />

                            <div className="space-y-5">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border border-border/50">
                                        <Wrench className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Service Specification</h3>
                                </div>
                                <div className="pl-9 space-y-5">
                                    <div className="bg-muted/30 p-6 rounded-[1.75rem] border border-dashed border-border/50 relative overflow-hidden group">
                                        <Activity className="absolute -right-4 -bottom-4 h-16 w-16 text-muted-foreground/5 group-hover:scale-110 transition-transform" />
                                        <p className="font-black uppercase tracking-widest text-xs text-primary mb-2 relative z-10">{service?.serviceName || 'Maintenance intake'}</p>
                                        <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed font-medium italic relative z-10">
                                            {service?.description || 'Standard technical diagnostics and general maintenance protocols.'}
                                        </p>
                                    </div>
                                    
                                    {mechanic && (
                                        <div className="flex items-center gap-4 text-xs font-bold bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                                                <AvatarFallback className="font-black text-[10px] bg-primary/10 text-primary">
                                                    {mechanic.fullName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-0.5">
                                                <span className="text-muted-foreground uppercase tracking-widest text-[9px] font-black">Authorized Lead</span>
                                                <p className="font-black text-sm uppercase tracking-tight">{mechanic.fullName}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {booking.notes && (
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border border-border/50">
                                            <MessageSquare className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Diagnostic Documentation</h3>
                                    </div>
                                    <div className="ml-9 p-6 rounded-[1.75rem] bg-amber-500/[0.03] border border-amber-500/10 relative overflow-hidden">
                                        <AlertCircle className="absolute -right-2 -bottom-2 h-10 w-10 text-amber-500/5" />
                                        <p className="text-[11px] italic font-medium leading-relaxed text-foreground/80 relative z-10">
                                            &quot;{booking.notes}&quot;
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </TabsContent>

                    <TabsContent value="communication" className="m-0 focus-visible:outline-none animate-in fade-in duration-500">
                        <div className="p-8">
                            <RelatedCommunications 
                                bookingId={booking.bookingId} 
                                onLogInteraction={() => setIsFormOpen(true)} 
                            />
                        </div>
                    </TabsContent>
                </ScrollArea>
            </Tabs>

            <div className="p-8 bg-muted/30 border-t flex flex-col gap-4 shrink-0 no-print">
                <Button 
                    className="w-full font-black uppercase tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] text-[11px]" 
                    onClick={() => onConvertToJobCard(booking)}
                    disabled={booking.status === 'Completed' || booking.status === 'Cancelled' || booking.status === 'Checked In'}
                >
                    <ClipboardPlus className="h-5 w-5 mr-3" /> Initialize Bay Intake
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                    {canMoveBookingStatus(booking.status, 'Confirmed') && (
                        <Button variant="outline" className="font-black text-[10px] uppercase tracking-widest bg-background h-12 rounded-xl border-border/50 hover:bg-muted" onClick={() => handleAction('Confirmed')}>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Confirm Window
                        </Button>
                    )}

                    {canMoveBookingStatus(booking.status, 'Checked In') && (
                        <Button variant="outline" className="font-black text-[10px] uppercase tracking-widest bg-background h-12 rounded-xl border-border/50 hover:bg-muted" onClick={() => handleAction('Checked In')}>
                            <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" /> Verify Check-In
                        </Button>
                    )}

                    {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                        <Button variant="outline" className="font-black text-[10px] uppercase tracking-widest bg-background h-12 rounded-xl border-border/50 hover:bg-muted" onClick={() => handleAction('No Show')}>
                            <Activity className="h-4 w-4 mr-2 text-orange-500" /> No Show
                        </Button>
                    )}

                    {(booking.status !== 'Completed' && booking.status !== 'Cancelled') && (
                        <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/10 h-12 rounded-xl" onClick={() => handleAction('Cancelled')}>
                            <XCircle className="h-4 w-4 mr-2" /> Cancel Record
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-muted/30 px-8 py-5 border-t flex items-center justify-center shrink-0">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.6em]">Makros System Intake OS • Internal Ledger synchronization active</p>
            </div>

            {/* Interaction Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[640px] p-0 border-border/50 overflow-hidden rounded-3xl shadow-2xl">
                    <DialogHeader className="p-8 border-b bg-muted/30">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                                <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Log Interaction</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Record an interaction trace for this scheduled intake.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <CommunicationForm 
                        onSubmit={handleLogInteraction} 
                        isSubmitting={isSubmitting} 
                        initialData={{
                            bookingId: booking.bookingId,
                            customerId: booking.customerId,
                            vehicleId: booking.vehicleId,
                            direction: 'Outgoing',
                            channel: 'Phone Call',
                            subject: `Follow-up for Booking #${booking.bookingId.slice(-4).toUpperCase()}`,
                        } as any}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}