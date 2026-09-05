'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Query } from 'firebase/firestore';
import { AssetType } from '@/types/asset';
import { JobCardStatus, JobCard } from '@/types/job-card';
import { Booking } from '@/types/booking';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { PlantEquipment } from '@/types/plant-equipment';
import { StaffMember } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
    Hammer,
    UserCheck,
    Layers
} from 'lucide-react';
import { mechanicAidJobCardCreation } from '@/ai/flows/mechanic-aid-job-card-creation-flow';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { initializeJobCardWithAI } from '@/services/job-cards-service';
import { updateBookingStatus } from '@/services/bookings-service';
import { calculateJobCardTotals } from '@/lib/job-card-calculations';
import { useAuth } from '@/contexts/auth-context';
import { FormattedDate } from '@/components/shared/formatted-date';
import { LoadingState } from '@/components/shared/loading-state';
import { SearchableSelect } from '@/components/shared/searchable-select';

const TECHNICIAN_ROLES = [
  "Senior Mechanic / Lead Mechanic",
  "Mechanic",
  "Diagnostic Technician",
  "Auto-Wiring Technician",
  "Welding Lead Technician",
  "Welding Technician",
  "Auto Body / Panel Beater",
  "Painter",
  "Tyre & Wheel Technician",
  "Car Wash / Detailing Technician",
];

function NewJobCardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingIdFromUrl = searchParams.get('bookingId');
    const assetIdFromUrl = searchParams.get('assetId');
    const assetTypeFromUrl = searchParams.get('assetType') as AssetType;
    
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const db = useFirestore();

    // 1. Operational State
    const [assetType, setAssetType] = useState<AssetType>(assetTypeFromUrl || 'Vehicle');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [selectedAssetId, setSelectedAssetId] = useState<string>(assetIdFromUrl || '');
    const [assignedMechanicId, setAssignedMechanicId] = useState<string>('');
    const [reportedIssue, setReportedIssue] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // AI State
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<any>(null);

    // 2. Data Streams
    const customersQuery = useMemoFirebase(() => query(collection(db, 'customers'), orderBy('fullName', 'asc')), [db]);
    const techniciansQuery = useMemoFirebase(() => query(collection(db, 'users'), where('status', '==', 'Active')), [db]);
    const { data: customers } = useCollection<Customer>(customersQuery as any);
    const { data: staff } = useCollection<StaffMember>(techniciansQuery as any);

    // Asset-specific streams
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

    const technicians = useMemo(() => staff?.filter(s => TECHNICIAN_ROLES.includes(s.role)) || [], [staff]);

    const handleAssetTypeShift = (type: AssetType) => {
        setAssetType(type);
        setSelectedAssetId('');
        setAiSuggestions(null);
    };

    const handleAiAnalyze = async () => {
        const asset = assetType === 'Vehicle' 
            ? vehicles?.find(v => v.vehicleId === selectedAssetId)
            : plants?.find(p => p.id === selectedAssetId);

        if (!reportedIssue || !asset) {
            toast({ title: "Reference Required", description: "Define symptoms and select an asset for analysis.", variant: "destructive" });
            return;
        }

        setIsAiLoading(true);
        try {
            const result = await mechanicAidJobCardCreation({
                reportedIssue,
                vehicleMake: asset.make,
                vehicleModel: asset.model,
                vehicleYear: Number((asset as any).year || (asset as any).yearOfManufacture || 2020),
            });
            
            setAiSuggestions({
                ...result,
                estimatedLaborCost: Math.round(result.estimatedLaborCost * 3750 / 1000) * 1000
            });
            toast({ title: "Roadmap Generated", description: "AI Repair Intelligence has drafted a technical plan." });
        } catch (error) {
            toast({ title: "Analysis Offline", description: "Could not establish connection to diagnostic neural network.", variant: "destructive" });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!selectedCustomerId || !selectedAssetId || !currentUser) return;

        setIsSubmitting(true);
        try {
            const totals = calculateJobCardTotals({ serviceAmount: 0, additionalLaborCost: 0, partsTotal: 0 });
            
            const jobCardId = await initializeJobCardWithAI({
                customerId: selectedCustomerId,
                assetId: selectedAssetId,
                assetType: assetType,
                assignedMechanicId: assignedMechanicId || undefined,
                reportedIssue,
                ...totals,
                userId: currentUser.userId,
                aiSuggestions: aiSuggestions ? {
                    tasks: aiSuggestions.suggestedTasks,
                    parts: aiSuggestions.requiredParts
                } : undefined
            } as any);

            toast({ title: "Bay Load Initialized", description: `Operation Dossier ${jobCardId.toUpperCase().slice(-6)} committed to registry.` });
            router.push(`/job-cards/${jobCardId}`);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Initialization Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const assetOptions = useMemo(() => {
        if (assetType === 'Vehicle') {
            return vehicles?.map(v => ({
                value: v.vehicleId,
                label: `${v.make} ${v.model}`,
                description: v.numberPlate,
                icon: <Car className="h-4 w-4" />
            })) || [];
        } else {
            return plants?.map(p => ({
                value: p.id,
                label: p.name,
                description: p.assetId,
                icon: <Hammer className="h-4 w-4" />
            })) || [];
        }
    }, [assetType, vehicles, plants]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-32">
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
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Initializing Polymorphic Operation Dossier</p>
                        </div>
                    </div>
                    
                    <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                        <Button 
                            variant={assetType === 'Vehicle' ? 'secondary' : 'ghost'} 
                            onClick={() => handleAssetTypeShift('Vehicle')}
                            className="h-10 text-[10px] font-black uppercase tracking-widest px-6 rounded-xl transition-all"
                        >
                            <Car className="h-3.5 w-3.5 mr-2" /> Vehicle
                        </Button>
                        <Button 
                            variant={assetType === 'Plant' ? 'secondary' : 'ghost'} 
                            onClick={() => handleAssetTypeShift('Plant')}
                            className="h-10 text-[10px] font-black uppercase tracking-widest px-6 rounded-xl transition-all"
                        >
                            <Hammer className="h-3.5 w-3.5 mr-2" /> Plant & Equipment
                        </Button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card shadow-sm">
                        <CardHeader className="bg-muted/30 border-b p-8">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-green-500" /> Registry Context
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <User className="h-3 w-3 text-primary" /> Client Identification
                                    </Label>
                                    <SearchableSelect 
                                        options={customers?.map(c => ({ value: c.customerId, label: c.fullName, description: c.phone })) || []}
                                        value={selectedCustomerId}
                                        onValueChange={setSelectedCustomerId}
                                        placeholder="Search customer registry..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Layers className="h-3 w-3 text-primary" /> Target Asset ({assetType})
                                    </Label>
                                    <SearchableSelect 
                                        options={assetOptions}
                                        value={selectedAssetId}
                                        onValueChange={setSelectedAssetId}
                                        disabled={!selectedCustomerId}
                                        isLoading={vLoading || pLoading}
                                        placeholder={`Identify ${assetType.toLowerCase()} unit...`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <UserCheck className="h-3 w-3 text-primary" /> Lead Technician
                                </Label>
                                <SearchableSelect 
                                    options={technicians.map(t => ({ value: t.userId, label: t.fullName, description: t.role }))}
                                    value={assignedMechanicId}
                                    onValueChange={setAssignedMechanicId}
                                    placeholder="Assign lead technical personnel..."
                                />
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
                                disabled={isAiLoading || !reportedIssue || !selectedAssetId}
                                className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-all"
                            >
                                {isAiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                AI Assistance
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <Textarea 
                                placeholder="Describe the technical drift, symptoms, or requested maintenance..." 
                                value={reportedIssue}
                                onChange={(e) => setReportedIssue(e.target.value)}
                                className="min-h-[160px] rounded-[1.5rem] bg-muted/20 border-none resize-none p-6 font-medium text-sm leading-relaxed"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6 sticky top-24">
                    {aiSuggestions ? (
                        <Card className="bg-slate-900 border-none text-white rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            <CardHeader className="relative z-10 border-b border-white/10 p-8">
                                <div className="flex items-center gap-2 text-primary mb-1">
                                    <Sparkles className="h-4 w-4 fill-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Technical Blueprint</span>
                                </div>
                                <CardTitle className="text-xl font-black uppercase tracking-tight">Roadmap Ready</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8 relative z-10">
                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2"><Wrench className="h-3 w-3 text-primary" /> Roadmap Tasks</h4>
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
                                    <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase">Neural Sync</Badge>
                                </div>
                                <Button className="w-full h-14 mt-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]" onClick={handleCreate} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardPlus className="mr-2 h-4 w-4" />}
                                    Initialize Dossier
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <ShieldCheck className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" /> Technical Protocol
                                </h4>
                                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
                                    Selecting the correct asset type ensures the technical roadmap is calibrated to the machine&apos;s specific engineering requirements.
                                </p>
                            </div>
                            <Button 
                                className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20"
                                onClick={handleCreate}
                                disabled={!selectedAssetId || !reportedIssue || isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardPlus className="mr-2 h-4 w-4" />}
                                Manual Registry Intake
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function NewJobCardPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NewJobCardContent />
        </Suspense>
    );
}
