'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Query } from 'firebase/firestore';
import { JobCardStatus, JobCard } from '@/types/job-card';
import { Booking } from '@/types/booking';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { StaffMember } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
    ClipboardPlus, 
    Sparkles, 
    Wrench, 
    Car, 
    User, 
    Calendar, 
    ArrowLeft, 
    AlertCircle,
    CheckCircle2,
    Hash,
    Loader2,
    Package,
    ShieldCheck,
    History,
    UserCheck
} from 'lucide-react';
import { mechanicAidJobCardCreation } from '@/ai/flows/mechanic-aid-job-card-creation-flow';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { initializeJobCardWithAI } from '@/services/job-cards-service';
import { updateBookingStatus } from '@/services/bookings-service';
import { calculateJobCardTotals } from '@/lib/job-card-calculations';
import { useAuth } from '@/contexts/auth-context';
import { FormattedDate } from '@/components/shared/formatted-date';
import { JobStatusBadge } from './job-status-badge';
import { LoadingState } from '@/components/shared/loading-state';

/**
 * @fileOverview Technical Intake & AI Roadmap Terminal.
 * Stabilized with useMemoFirebase to manage cross-registry dependencies.
 */
export function NewJobCardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingIdFromUrl = searchParams.get('bookingId');
    const mechanicIdFromUrl = searchParams.get('mechanicId');
    
    const { toast } = useToast();
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const db = useFirestore();

    // Authority Logic
    const isAuthorized = useMemo(() => {
        const allowedRoles = ['Makros System Owner', 'Workshop Manager', 'Receptionist'];
        return currentUser && allowedRoles.includes(currentUser.role);
    }, [currentUser]);

    useEffect(() => {
        if (currentUser && !isAuthorized) {
            router.push('/dashboard');
            toast({ title: "Authorization Required", description: "Insufficient clearance for technical intake.", variant: "destructive" });
        }
    }, [currentUser, isAuthorized, router, toast]);

    // Form State
    const [intakeMode, setIntakeMode] = useState<'booking' | 'walkin'>(bookingIdFromUrl ? 'booking' : 'walkin');
    const [selectedBookingId, setSelectedBookingId] = useState<string>(bookingIdFromUrl || '');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [assignedMechanicId, setAssignedMechanicId] = useState<string>(mechanicIdFromUrl || '');
    const [reportedIssue, setReportedIssue] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // AI State
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<any>(null);

    // 1. Technical Context Streams (Stabilized)
    const bookingsQuery = useMemoFirebase(() => {
        if (!db || !isAuthorized) return null;
        return query(collection(db, 'bookings'), where('status', 'in', ['Confirmed', 'Pending', 'Checked In'])) as Query<Booking>;
    }, [db, isAuthorized]);

    const customersQuery = useMemoFirebase(() => {
        if (!db || !isAuthorized) return null;
        return query(collection(db, 'customers'), orderBy('fullName', 'asc')) as Query<Customer>;
    }, [db, isAuthorized]);

    const usersQuery = useMemoFirebase(() => {
        if (!db || !isAuthorized) return null;
        return query(collection(db, 'users'), where('role', '==', 'Mechanic'), where('status', '==', 'Active')) as Query<StaffMember>;
    }, [db, isAuthorized]);

    const servicesQuery = useMemoFirebase(() => {
        if (!db || !isAuthorized) return null;
        return query(collection(db, 'services'), where('status', '==', 'Active'));
    }, [db, isAuthorized]);

    const { data: bookings } = useCollection<Booking>(bookingsQuery);
    const { data: customers } = useCollection<Customer>(customersQuery);
    const { data: services } = useCollection<any>(servicesQuery as any);
    const { data: staff } = useCollection<StaffMember>(usersQuery);

    // 2. Dynamic Asset Stream (Filtered by Customer)
    const vehiclesQuery = useMemoFirebase(() => {
        if (!db || !selectedCustomerId) return null;
        return query(collection(db, 'vehicles'), where('customerId', '==', selectedCustomerId)) as Query<Vehicle>;
    }, [db, selectedCustomerId]);
    const { data: vehicles, loading: vLoading } = useCollection<Vehicle>(vehiclesQuery);

    // 3. Vehicle History Stream
    const historyQuery = useMemoFirebase(() => {
        if (!db || !selectedVehicleId) return null;
        return query(collection(db, 'jobCards'), where('vehicleId', '==', selectedVehicleId), orderBy('createdAt', 'desc')) as Query<JobCard>;
    }, [db, selectedVehicleId]);
    const { data: jobHistory } = useCollection<JobCard>(historyQuery);

    // Synchronize form when a booking is selected
    useEffect(() => {
        if (intakeMode === 'booking' && selectedBookingId && bookings?.length && services?.length) {
            const dossier = bookings.find(b => b.bookingId === selectedBookingId || (b as any).id === selectedBookingId);
            if (dossier) {
                const srcSrv = services.find((s: any) => s.id === dossier.serviceId || s.serviceId === dossier.serviceId);
                setSelectedCustomerId(dossier.customerId);
                setSelectedVehicleId(dossier.vehicleId);
                setReportedIssue(dossier.notes || srcSrv?.description || '');
                if (!mechanicIdFromUrl) {
                    setAssignedMechanicId(dossier.assignedMechanicId || '');
                }
            }
        }
    }, [selectedBookingId, intakeMode, bookings, services, mechanicIdFromUrl]);

    const handleAiAnalyze = async () => {
        const vehicle = vehicles?.find(v => v.vehicleId === selectedVehicleId || (v as any).id === selectedVehicleId);
        if (!reportedIssue || !vehicle) {
            toast({ title: "Validation Error", description: "AI analysis requires symptoms and a vehicle reference.", variant: "destructive" });
            return;
        }

        setIsAiLoading(true);
        try {
            const result = await mechanicAidJobCardCreation({
                reportedIssue: reportedIssue,
                vehicleMake: vehicle.make,
                vehicleModel: vehicle.model,
                vehicleYear: Number(vehicle.year || 2020),
            });
            
            const localizedResult = {
                ...result,
                estimatedLaborCost: Math.round(result.estimatedLaborCost * 3750 / 1000) * 1000
            };
            
            setAiSuggestions(localizedResult);
            toast({ title: "Analysis Complete", description: "AI Repair Intelligence roadmap generated." });
        } catch (error) {
            toast({ title: "Analysis Failed", description: "Neural service unreachable.", variant: "destructive" });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!selectedCustomerId || !selectedVehicleId || !currentUser) {
            toast({ title: "Validation Error", description: "Registry references incomplete.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const bookingDossier = intakeMode === 'booking' ? bookings?.find(b => b.bookingId === selectedBookingId || (b as any).id === selectedBookingId) : null;
            const serviceId = bookingDossier?.serviceId;
            const selectedService = services?.find((s: any) => s.id === serviceId || s.serviceId === serviceId);

            const serviceAmount = selectedService?.defaultLaborCost || 0;
            const totals = calculateJobCardTotals({ serviceAmount, additionalLaborCost: 0, partsTotal: 0 });

            const jobCardId = await initializeJobCardWithAI({
                customerId: selectedCustomerId,
                vehicleId: selectedVehicleId,
                bookingId: intakeMode === 'booking' ? selectedBookingId : undefined,
                serviceId: serviceId || undefined,
                assignedMechanicId: assignedMechanicId || undefined,
                reportedIssue,
                ...totals,
                userId: currentUser.userId,
                aiSuggestions: aiSuggestions ? {
                    tasks: aiSuggestions.suggestedTasks,
                    parts: aiSuggestions.requiredParts
                } : undefined
            } as any);

            if (intakeMode === 'booking' && selectedBookingId) {
                updateBookingStatus(selectedBookingId, 'Checked In', currentUser.userId);
            }

            toast({ title: "Operation Initialized", description: `Dossier ${jobCardId.toUpperCase().slice(-6)} created.` });
            router.push(`/job-cards/${jobCardId}`);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Intake Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) return <LoadingState />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3 h-8 text-[10px] font-black uppercase tracking-widest gap-2 text-muted-foreground hover:text-primary">
                    <ArrowLeft className="h-3 w-3" /> Back
                </Button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                            <ClipboardPlus className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase font-headline">Technical Intake</h1>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Initializing Forensic Repair Dossier</p>
                        </div>
                    </div>
                    
                    <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                        <Button 
                            variant={intakeMode === 'booking' ? 'secondary' : 'ghost'} 
                            onClick={() => { setIntakeMode('booking'); setSelectedBookingId(''); }}
                            className="h-10 text-[10px] font-black uppercase tracking-widest px-6 rounded-xl transition-all"
                        >
                            Queue Intake
                        </Button>
                        <Button 
                            variant={intakeMode === 'walkin' ? 'secondary' : 'ghost'} 
                            onClick={() => { setIntakeMode('walkin'); setSelectedBookingId(''); }}
                            className="h-10 text-[10px] font-black uppercase tracking-widest px-6 rounded-xl transition-all"
                        >
                            Direct Intake
                        </Button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card shadow-sm">
                        <CardHeader className="bg-muted/30 border-b p-8">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-green-500" /> Personnel & Asset Registry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {intakeMode === 'booking' ? (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-3 w-3 text-indigo-500" /> Appointment Queue
                                    </Label>
                                    <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold">
                                            <SelectValue placeholder="Search appointment registry..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50">
                                            {bookings?.map(b => (
                                                <SelectItem key={b.bookingId || (b as any).id} value={b.bookingId || (b as any).id} className="font-bold text-xs py-3">
                                                    #{ (b.bookingId || (b as any).id).toUpperCase().slice(-8)} • {b.bookingDate} • {customers?.find(c => c.customerId === b.customerId || (c as any).id === b.customerId)?.fullName || 'Trace Pending'}
                                                </SelectItem>
                                            ))}
                                            {(!bookings || bookings.length === 0) && <SelectItem value="none" disabled>Queue empty.</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                            <User className="h-3 w-3 text-primary" /> Client Identification
                                        </Label>
                                        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                            <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold">
                                                <SelectValue placeholder="Identify client..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/50">
                                                {customers?.map(c => (
                                                    <SelectItem key={c.customerId || (c as any).id} value={c.customerId || (c as any).id} className="font-bold text-xs uppercase py-3">{c.fullName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                            <Car className="h-3 w-3 text-primary" /> Registered Asset
                                        </Label>
                                        <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId} disabled={!selectedCustomerId}>
                                            <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold">
                                                {vLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SelectValue placeholder="Identify unit..." />}
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/50">
                                                {vehicles?.map(v => (
                                                    <SelectItem key={v.vehicleId || (v as any).id} value={v.vehicleId || (v as any).id} className="font-bold text-xs uppercase py-3">{v.make} {v.model} ({v.numberPlate})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                    <UserCheck className="h-3 w-3 text-primary" /> Technical Assignment
                                </Label>
                                <Select value={assignedMechanicId} onValueChange={setAssignedMechanicId}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold">
                                        <SelectValue placeholder="Assign lead technician..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50">
                                        {staff?.map(m => (
                                            <SelectItem key={m.userId || (m as any).id} value={m.userId || (m as any).id} className="font-bold text-xs uppercase py-3">{m.fullName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card shadow-sm">
                        <CardHeader className="bg-muted/30 border-b p-8 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500" /> Operational Diagnosis
                            </CardTitle>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleAiAnalyze}
                                disabled={isAiLoading || !reportedIssue || !selectedVehicleId}
                                className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-all"
                            >
                                {isAiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                AI Assistance
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <Textarea 
                                placeholder="Enter physical symptoms or technical drift observations..." 
                                value={reportedIssue}
                                onChange={(e) => setReportedIssue(e.target.value)}
                                className="min-h-[160px] rounded-[1.5rem] bg-muted/20 border-none resize-none p-6 font-medium text-sm leading-relaxed"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6 sticky top-24">
                    {aiSuggestions ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <Card className="bg-slate-900 border-none text-white rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                                <CardHeader className="relative z-10 border-b border-white/10 p-8">
                                    <div className="flex items-center gap-2 text-primary mb-1">
                                        <Sparkles className="h-4 w-4 fill-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Roadmap</span>
                                    </div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">Blueprint Generated</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8 relative z-10">
                                    <div className="space-y-4">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2"><Wrench className="h-3 w-3 text-primary" /> Tasks</h4>
                                        <ul className="space-y-2.5">
                                            {aiSuggestions.suggestedTasks.map((task: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5 opacity-50" />
                                                    <span className="text-[11px] font-bold text-white/80 leading-relaxed uppercase tracking-tight">{task}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Separator className="bg-white/10" />

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Est. Labor Yield</p>
                                            <p className="text-3xl font-black text-white"><CurrencyFormat value={aiSuggestions.estimatedLaborCost} /></p>
                                        </div>
                                        <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black">NEURAL_SYNC</Badge>
                                    </div>
                                </CardContent>
                                <div className="absolute left-0 bottom-0 right-0 h-1 bg-gradient-to-r from-primary to-indigo-500" />
                            </Card>
                            
                            <Button 
                                className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                                onClick={handleCreate}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <ClipboardPlus className="h-5 w-5 mr-3" />}
                                Commit Certified Dossier
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {selectedVehicleId && jobHistory && jobHistory.length > 0 && (
                                <Card className="rounded-3xl border-border/50 bg-card overflow-hidden">
                                    <CardHeader className="bg-muted/30 border-b p-6">
                                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                                            <History className="h-4 w-4 text-primary" /> Asset History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="max-h-[300px] overflow-y-auto divide-y">
                                            {jobHistory.map(job => (
                                                <div key={job.jobCardId || (job as any).id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-black uppercase truncate max-w-[140px]">{job.reportedIssue}</p>
                                                        <p className="text-[8px] font-bold text-muted-foreground uppercase"><FormattedDate date={job.createdAt} formatString="dd MMM yyyy" /></p>
                                                    </div>
                                                    <JobStatusBadge status={job.status} className="text-[7px]" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Button 
                                className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
                                onClick={handleCreate}
                                disabled={!selectedCustomerId || !selectedVehicleId || !reportedIssue || isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <ClipboardPlus className="h-5 w-5 mr-3" />}
                                Manual Intake
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            
            <footer className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center rounded-b-[2.5rem]">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.5em]">Makros System Technical Operations • Internal Intake Registry</p>
            </footer>
        </div>
    );
}
