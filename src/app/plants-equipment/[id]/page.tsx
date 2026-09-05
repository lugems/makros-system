'use client';

import React, { useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import { 
    Hammer, 
    ShieldCheck, 
    Fingerprint, 
    Truck, 
    Calendar, 
    History as HistoryIcon, 
    ArrowLeft,
    TrendingUp,
    Warehouse,
    AlertTriangle,
    Activity,
    Edit,
    Banknote,
    Layers,
    Trash2,
    Tag,
    ShieldAlert,
    Gauge,
    Fuel,
    MapPin,
    Users,
    ClipboardList,
    Wrench,
    ChevronRight,
    Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FormattedDate } from '@/components/shared/formatted-date';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { LoadingState } from '@/components/shared/loading-state';
import { PlantEquipment } from '@/types/plant-equipment';
import { Customer } from '@/types/customer';
import { JobCard } from '@/types/job-card';
import { getMeterUnit, getAssetDisplayData } from '@/services/asset-resolver-service';
import { useAuth } from '@/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RelatedCommunications } from '@/components/communications/related-communications';
import { JobStatusBadge } from '@/components/job-cards/job-status-badge';

/**
 * @fileOverview Technical Dossier for Plant & Equipment.
 * Provides a high-fidelity overview of industrial machinery specifications and operational history.
 */
export default function PlantDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const db = useFirestore();
    const { role, user: currentUser, isLoading: authLoading } = useAuth();

    const id = params.id as string;

    const isAuthorized = useMemo(() => 
        ['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Senior Mechanic / Lead Mechanic', 'Inventory Officer'].includes(role || '')
    , [role]);

    // Technical Data Streams
    const plantRef = useMemoFirebase(() => {
        if (!db || !isAuthorized) return null;
        return doc(db, 'plantsAndEquipment', id) as DocumentReference<PlantEquipment>;
    }, [db, isAuthorized, id]);

    const { data: plant, loading: pLoading } = useDoc<PlantEquipment>(plantRef);

    const custRef = useMemoFirebase(() => {
        if (!db || !plant?.ownerId) return null;
        return doc(db, 'customers', plant.ownerId) as DocumentReference<Customer>;
    }, [db, plant?.ownerId]);

    const { data: customer, loading: cLoading } = useDoc<Customer>(custRef);

    const jobsQuery = useMemoFirebase(() => {
        if (!db || !isAuthorized) return null;
        return query(collection(db, 'jobCards'), where('assetId', '==', id), orderBy('createdAt', 'desc'));
    }, [db, isAuthorized, id]);

    const { data: history, loading: jLoading } = useCollection<JobCard>(jobsQuery as any);

    if (authLoading || pLoading || cLoading || jLoading) return <LoadingState />;

    if (!plant) {
        return (
            <div className="p-20 text-center border-2 border-dashed rounded-[2.5rem] opacity-40">
                <Hammer className="h-12 w-12 mx-auto mb-4" />
                <p className="text-sm font-medium italic">Asset dossier not located in technical registry.</p>
                <Button variant="link" onClick={() => router.push('/plants-equipment')} className="mt-4">Return to Fleet</Button>
            </div>
        );
    }

    const unit = getMeterUnit(plant.meterType);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
            {/* Dossier Header */}
            <div className="bg-muted/30 px-8 py-12 border-b relative overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                    <Hammer className="h-64 w-64" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-32 w-32 rounded-[2rem] bg-primary/10 border-4 border-background flex items-center justify-center shadow-2xl ring-8 ring-primary/5">
                            <Hammer className="h-16 w-16 text-primary" />
                        </div>
                        <div className="space-y-3 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Fingerprint className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground">
                                    UID: {plant.assetId.toUpperCase()}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase font-headline leading-none text-foreground">
                                {plant.name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
                                <Badge variant="outline" className="h-8 text-xs font-mono font-black text-primary bg-primary/5 px-4 border-primary/20 rounded-lg shadow-sm">
                                    S/N: {plant.serialNumber}
                                </Badge>
                                <Badge variant="outline" className="h-8 text-[9px] font-black uppercase tracking-widest px-4 shadow-sm bg-muted/50 border-none">
                                    {plant.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Card className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden border-none min-w-[240px]">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl" />
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Current Utilization</p>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                <Gauge className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-black tracking-tighter">{plant.meterReading.toLocaleString()} {unit}</p>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Master Telemetry Sync</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start px-8">
                <div className="lg:col-span-8 space-y-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <div className="bg-card border border-border/50 rounded-2xl p-1.5 mb-8 shadow-sm overflow-x-auto custom-scrollbar">
                            <TabsList className="bg-transparent h-auto gap-1 p-0 flex justify-start w-full min-w-max">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Overview</TabsTrigger>
                                <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Service History</TabsTrigger>
                                <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Technical Docs</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
                             <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Technical Specification Dossier</h3>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => router.push('/plants-equipment')} className="text-[10px] font-black uppercase tracking-widest gap-2">
                                        <ArrowLeft className="h-3 w-3" /> Back to registry
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/10 p-8 rounded-[2.5rem] border border-border/50">
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Make & Model</label>
                                            <p className="text-base font-bold flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-primary shrink-0" />
                                                {plant.make} {plant.model}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</label>
                                            <p className="text-base font-bold flex items-center gap-2">
                                                <Layers className="h-4 w-4 text-primary shrink-0" />
                                                {plant.category}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Power Configuration</label>
                                            <p className="text-base font-bold flex items-center gap-2">
                                                <Fuel className="h-4 w-4 text-primary shrink-0" />
                                                {plant.powerType}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manufacturer</label>
                                            <p className="text-base font-bold flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-primary shrink-0" />
                                                {plant.manufacturer || 'Sync Pending'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Location</label>
                                            <p className="text-base font-medium italic flex items-start gap-2 leading-relaxed">
                                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                {plant.location || 'Site deployment unrecorded.'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mfg Year</label>
                                            <p className="text-base font-bold flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                                                Cycle {plant.yearOfManufacture}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {plant.notes && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-muted-foreground px-2">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-foreground">Operational Remarks</h3>
                                    </div>
                                    <div className="bg-orange-500/[0.03] border border-orange-500/10 p-6 rounded-[2rem] relative overflow-hidden">
                                        <p className="text-sm font-medium leading-relaxed italic text-foreground/80 relative z-10">
                                            &quot;{plant.notes}&quot;
                                        </p>
                                        <Activity className="absolute -right-4 -bottom-4 h-16 w-16 text-orange-500/5" />
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="space-y-8 focus-visible:outline-none animate-in fade-in duration-500">
                             <div className="space-y-6">
                                <div className="flex items-center gap-3 text-muted-foreground px-2">
                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                        <HistoryIcon className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Maintenance Ledger</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    {history && history.length > 0 ? (
                                        history.map((job) => (
                                            <div 
                                                key={job.jobCardId} 
                                                className="group relative flex items-center justify-between p-5 rounded-2xl border border-border/50 hover:border-primary/40 bg-card transition-all cursor-pointer shadow-sm"
                                                onClick={() => router.push(`/job-cards/${job.jobCardId}`)}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform">
                                                        <Wrench className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-md">
                                                            {job.reportedIssue}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            <span><FormattedDate date={job.createdAt} formatString="dd MMM yyyy" /></span>
                                                            <span>•</span>
                                                            <span>Dossier: {job.jobCardId.slice(-6).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <JobStatusBadge status={job.status} className="text-[8px]" />
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-16 text-center border-2 border-dashed rounded-3xl bg-muted/5 opacity-40">
                                            <ClipboardList className="h-10 w-10 mx-auto mb-3" />
                                            <p className="text-sm font-medium italic">No historical repair cycles detected for this machine.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="documents" className="space-y-8 focus-visible:outline-none animate-in fade-in duration-500">
                             <div className="space-y-6">
                                <div className="flex items-center gap-3 text-muted-foreground px-2">
                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                        <Camera className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Forensic Imagery Registry</h3>
                                </div>
                                <div className="py-12 text-center border-2 border-dashed rounded-3xl bg-muted/5 opacity-40">
                                    <p className="text-sm font-medium italic">Document registry synchronization coming soon.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Context */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card premium-shadow">
                        <CardHeader className="bg-muted/30 border-b py-6 px-8">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Certified Ownership</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 ring-4 ring-primary/5">
                                    <AvatarFallback className="font-black text-xl bg-primary/10 text-primary uppercase">
                                        {customer?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="text-base font-black uppercase tracking-tight">{customer?.fullName || 'Registry Void'}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                        <ShieldCheck className="h-3 w-3 text-green-500" /> Verified Authority
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Contact Reach</p>
                                    <p className="text-sm font-bold">{customer?.phone || 'NO_CONTACT_DATA'}</p>
                                </div>
                            </div>
                            
                            <Separator className="opacity-50" />
                            
                            <Button 
                                variant="outline" 
                                className="w-full h-11 font-black uppercase tracking-widest text-[10px] rounded-xl bg-background"
                                onClick={() => customer && router.push(`/customers/${customer.customerId}`)}
                            >
                                View Authority Profile
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl relative overflow-hidden group">
                        <Activity className="absolute -right-4 -bottom-4 h-16 w-16 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                            <Activity className="h-3 w-3" /> Technical Pulse
                        </h4>
                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
                            Asset telemetry verified. Maintenance intervals are calibrated to the manufacturer specification registry.
                        </p>
                    </div>

                    <div className="space-y-4 px-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Registry Date</span>
                            <span className="text-foreground font-black"><FormattedDate date={plant.createdAt} formatString="dd/MM/yyyy" /></span>
                        </div>
                        <Separator className="opacity-50" />
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Condition</span>
                            <span className="text-foreground font-black uppercase">{plant.condition}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] text-center">Makros System Technical Directory • Asset Reference Classified</p>
            </div>
        </div>
    );
}

function Building2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
        </svg>
    )
}
