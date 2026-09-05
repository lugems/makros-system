'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Query } from 'firebase/firestore';
import { JobCardStatus, JobCard } from '@/types/job-card';
import { AssetType } from '@/types/asset';
import { Booking } from '@/types/booking';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { PlantEquipment } from '@/types/plant-equipment';
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
    UserCheck,
    Hammer,
    Fingerprint
} from 'lucide-react';
import { mechanicAidJobCardCreation } from '@/ai/flows/mechanic-aid-job-card-creation-flow';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { initializeJobCardWithAI } from '@/services/job-cards-service';
import { updateBookingStatus } from '@/services/bookings-service';
import { useAuth } from '@/contexts/auth-context';
import { FormattedDate } from '@/components/shared/formatted-date';
import { JobStatusBadge } from './job-status-badge';
import { LoadingState } from '@/components/shared/loading-state';
import { SearchableSelect } from '@/components/shared/searchable-select';

const TECHNICIAN_ROLES = [
  "Senior Mechanic / Lead Mechanic", "Mechanic", "Diagnostic Technician",
  "Auto-Wiring Technician", "Welding Lead Technician", "Welding Technician",
  "Auto Body / Panel Beater", "Painter", "Tyre & Wheel Technician", "Car Wash / Detailing Technician",
];

export function NewJobCardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingIdFromUrl = searchParams.get('bookingId');
    const assetIdFromUrl = searchParams.get('assetId');
    const assetTypeFromUrl = searchParams.get('assetType') as AssetType | null;
    
    const { toast } = useToast();
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const db = useFirestore();

    const isAuthorized = useMemo(() => {
        const allowedRoles = ['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Senior Mechanic / Lead Mechanic'];
        return currentUser && allowedRoles.includes(currentUser.role);
    }, [currentUser]);

    // State
    const [intakeMode, setIntakeMode] = useState<'booking' | 'walkin'>(bookingIdFromUrl ? 'booking' : 'walkin');
    const [assetType, setAssetType] = useState<AssetType>(assetTypeFromUrl || 'Vehicle');
    const [selectedBookingId, setSelectedBookingId] = useState<string>(bookingIdFromUrl || '');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [selectedAssetId, setSelectedAssetId] = useState<string>(assetIdFromUrl || '');
    const [assignedMechanicId, setAssignedMechanicId] = useState<string>('');
    const [reportedIssue, setReportedIssue] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<any>(null);

    // Queries
    const bookingsQuery = useMemoFirebase(() => query(collection(db, 'bookings'), where('status', 'in', ['Confirmed', 'Pending', 'Checked In'])), [db]);
    const customersQuery = useMemoFirebase(() => query(collection(db, 'customers'), orderBy('fullName', 'asc')), [db]);
    const usersQuery = useMemoFirebase(() => query(collection(db, 'users'), where('status', '==', 'Active')), [db]);

    const { data: bookings } = useCollection<Booking>(bookingsQuery as any);
    const { data: customers } = useCollection<Customer>(customersQuery as any);
    const { data: allStaff } = useCollection<StaffMember>(usersQuery as any);

    // Asset Queries - Filtered by Customer + AssetType
    const vehiclesQuery = useMemoFirebase(() => {
        if (!selectedCustomerId || assetType !== 'Vehicle') return null;
        return query(collection(db, 'vehicles'), where('customerId', '==', selectedCustomerId));
    }, [db, selectedCustomerId, assetType]);

    const plantsQuery = useMemoFirebase(() => {
        if (!selectedCustomerId || assetType !== 'Plant') return null;
        return query(collection(db, 'plantsAndEquipment'), where('ownerId', '==', selectedCustomerId));
    }, [db, selectedCustomerId, assetType]);

    const { data: vehicles, loading: vLoading } = useCollection<Vehicle>(vehiclesQuery as any);
    const { data: plants, loading: pLoading } = useCollection<PlantEquipment>(plantsQuery as any);

    const technicians = useMemo(() => allStaff?.filter(s => TECHNICIAN_ROLES.includes(s.role)) || [], [allStaff]);

    // Effect: Handle asset classification changes
    const handleAssetTypeChange = (type: AssetType) => {
        setAssetType(type);
        setSelectedAssetId('');
        setAiSuggestions(null);
    };

    // Effect: Handle customer changes (reset asset)
    useEffect(() => {
        if (intakeMode === 'walkin') {
            setSelectedAssetId('');
            setAiSuggestions(null);
        }
    }, [selectedCustomerId, intakeMode]);

    // Effect: Sync booking selection
    useEffect(() => {
        if (intakeMode === 'booking' && selectedBookingId && bookings) {
            const b = bookings.find(b => b.bookingId === selectedBookingId || (b as any).id === selectedBookingId);
            if (b) {
                setSelectedCustomerId(b.customerId);
                setAssetType(b.assetType || 'Vehicle');
                setSelectedAssetId(b.assetId || b.vehicleId || '');
                setReportedIssue(b.notes || '');
                setAssignedMechanicId(b.assignedMechanicId || '');
            }
        }
    }, [selectedBookingId, intakeMode, bookings]);

    const handleAiAnalyze = async () => {
        let asset: any = assetType === 'Vehicle' 
            ? vehicles?.find(v => v.vehicleId === selectedAssetId || (v as any).id === selectedAssetId)
            : plants?.find(p => p.id === selectedAssetId);

        if (!reportedIssue || !asset) {
            toast({ title: "Validation Error", description: "Inquiry needs a technical asset and symptoms.", variant: "destructive" });
            return;
        }

        setIsAiLoading(true);
        try {
            const result = await mechanicAidJobCardCreation({
                reportedIssue,
                vehicleMake: asset.make || asset.name,
                vehicleModel: asset.model || asset.category,
                vehicleYear: Number(asset.year || asset.yearOfManufacture || 2020),
            });
            setAiSuggestions({ ...result, estimatedLaborCost: result.estimatedLaborCost * 3750 });
            toast({ title: "Blueprint Generated", description: "AI Repair intelligence synthesized." });
        } catch (error) {
            toast({ title: "Analysis Failed", description: "Neural service unreachable.", variant: "destructive" });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!selectedCustomerId || !selectedAssetId || !currentUser) return;
        setIsSubmitting(true);
        try {
            const jobCardId = await initializeJobCardWithAI({
                customerId: selectedCustomerId,
                assetId: selectedAssetId,
                assetType,
                bookingId: intakeMode === 'booking' ? selectedBookingId : undefined,
                assignedMechanicId: assignedMechanicId || undefined,
                reportedIssue,
                laborCost: aiSuggestions?.estimatedLaborCost || 0,
                userId: currentUser.userId,
                aiSuggestions: aiSuggestions ? { tasks: aiSuggestions.suggestedTasks, parts: aiSuggestions.requiredParts } : undefined
            } as any);

            if (intakeMode === 'booking' && selectedBookingId) {
                updateBookingStatus(selectedBookingId, 'Checked In', currentUser.userId);
            }

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
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b p-8 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-green-500" /> Registry Identification
                            </CardTitle>
                            <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                                <Button size="sm" variant={intakeMode === 'booking' ? 'secondary' : 'ghost'} onClick={() => setIntakeMode('booking')} className="h-8 text-[9px] font-black uppercase rounded-lg px-4">Queue</Button>
                                <Button size="sm" variant={intakeMode === 'walkin' ? 'secondary' : 'ghost'} onClick={() => setIntakeMode('walkin')} className="h-8 text-[9px] font-black uppercase rounded-lg px-4">Walk-in</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center gap-2 p-1 rounded-2xl bg-muted/30 border">
                                <Button type="button" variant={assetType === 'Vehicle' ? 'secondary' : 'ghost'} onClick={() => handleAssetTypeChange('Vehicle')} className="flex-1 h-10 text-[9px] font-black uppercase rounded-xl gap-2"><Car className="h-3.5 w-3.5" /> Vehicle</Button>
                                <Button type="button" variant={assetType === 'Plant' ? 'secondary' : 'ghost'} onClick={() => handleAssetTypeChange('Plant')} className="flex-1 h-10 text-[9px] font-black uppercase rounded-xl gap-2"><Hammer className="h-3.5 w-3.5" /> Plant</Button>
                            </div>

                            {intakeMode === 'booking' && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1"><Calendar className="h-3 w-3 text-indigo-500" /> Appointment Selection</Label>
                                    <SearchableSelect 
                                        options={bookings?.map(b => ({ value: b.bookingId, label: `INTAKE #${b.bookingId.toUpperCase().slice(-6)}`, description: `${b.bookingDate} • ${b.preferredTime}` })) || []}
                                        value={selectedBookingId}
                                        onValueChange={setSelectedBookingId}
                                        placeholder="Identify scheduled intake..."
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1"><User className="h-3 w-3 text-primary" /> Client Authority</Label>
                                    <SearchableSelect 
                                        options={customers?.map(c => ({ value: c.customerId, label: c.fullName, description: c.phone })) || []}
                                        value={selectedCustomerId}
                                        onValueChange={setSelectedCustomerId}
                                        placeholder="Search customer registry..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">{assetType === 'Vehicle' ? <Car className="h-3 w-3" /> : <Hammer className="h-3 w-3" />} Technical Asset</Label>
                                    <SearchableSelect 
                                        options={assetType === 'Vehicle' 
                                            ? vehicles?.map(v => ({ value: v.vehicleId, label: `${v.make} ${v.model}`, description: v.numberPlate })) || []
                                            : plants?.map(p => ({ value: p.id, label: p.name, description: p.assetId })) || []
                                        }
                                        value={selectedAssetId}
                                        onValueChange={setSelectedAssetId}
                                        disabled={!selectedCustomerId}
                                        placeholder="Identify unit..."
                                        isLoading={vLoading || pLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1"><UserCheck className="h-3 w-3 text-primary" /> Technical Assignment</Label>
                                <Select value={assignedMechanicId} onValueChange={setAssignedMechanicId}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none font-bold">
                                        <SelectValue placeholder="Assign lead personnel..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50">
                                        {technicians.map(m => (
                                            <SelectItem key={m.userId} value={m.userId} className="font-bold text-xs uppercase py-3">{m.fullName} ({m.role.split(' ')[0]})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card shadow-sm">
                        <CardHeader className="bg-muted/30 border-b p-8 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500" /> Operational Diagnosis
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={handleAiAnalyze} disabled={isAiLoading || !reportedIssue || !selectedAssetId} className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary/5 text-primary border-primary/20">
                                {isAiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} AI Assistance
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <Textarea value={reportedIssue} onChange={(e) => setReportedIssue(e.target.value)} placeholder="Record technical drift or reported symptoms..." className="min-h-[160px] rounded-[1.5rem] bg-muted/10 border-none resize-none p-6 font-medium text-sm leading-relaxed" />
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
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2"><Wrench className="h-3 w-3 text-primary" /> Roadmap</h4>
                                        <ul className="space-y-2.5">
                                            {aiSuggestions.suggestedTasks.map((task: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5 opacity-50" />
                                                    <span className="text-[11px] font-bold text-white/80 uppercase tracking-tight">{task}</span>
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
                                        <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase">Neural Sync</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                            <Button className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20" onClick={handleCreate} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <ClipboardPlus className="h-5 w-5 mr-3" />} Commit Certified Dossier
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <Button className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20" onClick={handleCreate} disabled={!selectedCustomerId || !selectedAssetId || !reportedIssue || isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <ClipboardPlus className="h-5 w-5 mr-3" />} Manual Intake
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NewJobCardPage;