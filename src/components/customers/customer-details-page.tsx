'use client';

import React, { useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, 
    ShieldCheck, 
    Fingerprint, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    History, 
    Car, 
    ArrowLeft,
    Activity,
    CreditCard,
    ChevronRight,
    TrendingUp,
    MessageSquare,
    Layers,
    Wrench,
    Plus,
    Pencil,
    Loader2,
    Hammer,
    Binary
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FormattedDate } from '@/components/shared/formatted-date';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { JobStatusBadge } from '@/components/job-cards/job-status-badge';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy, DocumentReference, Query } from 'firebase/firestore';
import { LoadingState } from '@/components/shared/loading-state';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { PlantEquipment } from '@/types/plant-equipment';
import { JobCard } from '@/types/job-card';
import { Invoice } from '@/types/invoice';
import { StaffMember } from '@/types/staff';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelatedCommunications } from '@/components/communications/related-communications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CommunicationForm } from '@/components/communications/communication-form';
import { createCommunicationLog } from '@/services/communications-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { uploadStaffPhoto } from '@/lib/storage-service';
import { updateStaffRecord } from '@/services/users-service';

/**
 * @fileOverview High-fidelity "Account Dossier" view for a customer.
 * Synchronized with the polymorphic workshop core to display both Vehicles and Plant & Equipment.
 */
const CustomerDetailsPage = ({ params }: { params: { customerId: string } }) => {
    const router = useRouter();
    const db = useFirestore();
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // 1. Primary Record Fetch (Stabilized)
    const customerRef = useMemoFirebase(() => doc(db, 'customers', params.customerId) as DocumentReference<Customer>, [db, params.customerId]);
    const { data: customer, loading: customerLoading } = useDoc<Customer>(customerRef as any);

    const userProfileRef = useMemoFirebase(() => doc(db, 'users', params.customerId) as DocumentReference<StaffMember>, [db, params.customerId]);
    const { data: userProfile, loading: profileLoading } = useDoc<StaffMember>(userProfileRef as any);

    // 2. Linked Polymorphic Registries
    const vehiclesQuery = useMemoFirebase(() => query(collection(db, 'vehicles'), where('customerId', '==', params.customerId)) as Query<Vehicle>, [db, params.customerId]);
    const plantsQuery = useMemoFirebase(() => query(collection(db, 'plantsAndEquipment'), where('ownerId', '==', params.customerId)) as Query<PlantEquipment>, [db, params.customerId]);
    const jobsQuery = useMemoFirebase(() => query(collection(db, 'jobCards'), where('customerId', '==', params.customerId), orderBy('createdAt', 'desc')) as Query<JobCard>, [db, params.customerId]);
    const invoicesQuery = useMemoFirebase(() => query(collection(db, 'invoices'), where('customerId', '==', params.customerId), orderBy('issuedAt', 'desc')) as Query<Invoice>, [db, params.customerId]);

    const { data: clientVehicles, loading: vehLoading } = useCollection<Vehicle>(vehiclesQuery as any);
    const { data: clientPlants, loading: plantLoading } = useCollection<PlantEquipment>(plantsQuery as any);
    const { data: clientJobs, loading: jobLoading } = useCollection<JobCard>(jobsQuery as any);
    const { data: clientInvoices, loading: invLoading } = useCollection<Invoice>(invoicesQuery as any);

    const [isCommFormOpen, setIsCommFormOpen] = useState(false);
    const [isCommSubmitting, setIsCommSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const isLoading = customerLoading || profileLoading || vehLoading || plantLoading || jobLoading || invLoading;

    const totalSpent = useMemo(() => {
        return clientInvoices?.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0) || 0;
    }, [clientInvoices]);

    const handleLogInteraction = async (data: any) => {
        if (!customer || !currentUser) return;
        setIsCommSubmitting(true);
        try {
            await createCommunicationLog({
                ...data,
                customerId: customer.customerId,
                toName: customer.fullName,
                toRole: 'Customer'
            }, currentUser.userId);
            setIsCommFormOpen(false);
            toast({ title: "Interaction Logged", description: "Forensic trace committed to registry." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Operation Failed", description: error.message });
        } finally {
            setIsCommSubmitting(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !customer || !currentUser) return;

        setIsUploading(true);
        try {
            const downloadUrl = await uploadStaffPhoto(customer.customerId, file);
            await updateStaffRecord(customer.customerId, { photoUrl: downloadUrl }, currentUser.userId);
            toast({ title: "Profile Synchronized", description: "Identification imagery updated in the master registry." });
        } catch (error: any) {
            toast({ 
                variant: "destructive", 
                title: "Update Failed", 
                description: error.message || "Failed to synchronize profile imagery." 
            });
        } finally {
            setIsUploading(false);
        }
    };

    const canEdit = useMemo(() => {
        if (!currentUser) return false;
        return ['Makros System Owner', 'Workshop Manager', 'Receptionist'].includes(currentUser.role) || currentUser.userId === params.customerId;
    }, [currentUser, params.customerId]);

    if (isLoading) return <LoadingState />;

    if (!customer) {
        return (
            <div className="p-20 text-center border-2 border-dashed rounded-3xl opacity-40">
                <User className="h-12 w-12 mx-auto mb-4" />
                <p className="text-sm font-medium italic">Account profile not located in technical registry.</p>
                <Button variant="link" onClick={() => router.push('/customers')} className="mt-4">Return to Registry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
            {/* Dossier Header */}
            <div className="bg-muted/30 px-8 py-12 border-b relative overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                    <User className="h-64 w-64" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <Avatar className="h-32 w-32 ring-8 ring-primary/5 shadow-2xl transition-all group-hover:opacity-90">
                                <AvatarImage src={userProfile?.photoUrl || `https://picsum.photos/seed/${customer.customerId}/300/300`} />
                                <AvatarFallback className="font-black text-4xl bg-primary text-white">
                                    {customer.fullName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            {canEdit && (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                                >
                                    {isUploading ? <Loader2 className="h-8 w-8 text-white animate-spin" /> : <Pencil className="h-6 w-6 text-white" />}
                                </button>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handlePhotoUpload}
                            />
                        </div>
                        <div className="space-y-3 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Fingerprint className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground">
                                    UID: {customer.customerId.toUpperCase()}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase font-headline leading-tight">
                                {customer.fullName}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                                <Badge variant={customer.status === 'Active' ? 'success' : 'destructive'} className="h-8 text-[10px] font-black uppercase tracking-widest px-4 shadow-sm border-none">
                                    {customer.status === 'Active' ? 'Verified Client' : 'Inactive Record'}
                                </Badge>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Account Verified
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-4">
                        <Card className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden border-none min-w-[260px]">
                            <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl" />
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Life-to-Date Value</p>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                    <CreditCard className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xl font-black tracking-tight"><CurrencyFormat value={totalSpent} /></p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Total Workshop Yield</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    <Tabs defaultValue="overview" className="w-full">
                        <div className="bg-card border border-border/50 rounded-2xl p-1.5 mb-8 shadow-sm overflow-x-auto custom-scrollbar">
                            <TabsList className="bg-transparent h-auto gap-1 p-0 flex justify-start w-full min-w-max">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Technical Overview</TabsTrigger>
                                <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Service History</TabsTrigger>
                                <TabsTrigger value="communications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Interaction History</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Personnel Registry Dossier</h3>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => router.push('/customers')} className="text-[10px] font-black uppercase tracking-widest gap-2 w-fit">
                                        <ArrowLeft className="h-3 w-3" /> Back to registry
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/10 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border/50">
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Electronic Mail</label>
                                            <p className="text-sm font-bold flex items-center gap-2 break-all">
                                                <MailIcon className="h-4 w-4 text-primary shrink-0" />
                                                {customer.email || 'NO_DIGITAL_ADDRESS'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Authority</label>
                                            <p className="text-sm font-bold flex items-center gap-2">
                                                <PhoneIcon className="h-4 w-4 text-primary shrink-0" />
                                                {customer.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Physical Address</label>
                                            <p className="text-sm font-medium italic flex items-start gap-2 leading-relaxed">
                                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                {customer.address || 'Location data not recorded.'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enrollment Temporal Ref</label>
                                            <p className="text-sm font-bold flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                                                <FormattedDate date={customer.createdAt} formatString="dd MMMM yyyy" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Polymorphic Asset Register */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-muted-foreground px-2">
                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                        <Layers className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Registered Technical Assets</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Render Vehicles */}
                                    {clientVehicles?.map(vehicle => (
                                        <div 
                                            key={vehicle.vehicleId}
                                            onClick={() => router.push(`/vehicles/${vehicle.vehicleId}`)}
                                            className="group p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between shadow-sm"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Car className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate">
                                                        {vehicle.make} {vehicle.model}
                                                    </p>
                                                    <Badge variant="outline" className="text-[9px] font-mono font-black mt-1 py-0 border-primary/20 text-primary bg-primary/5">
                                                        {vehicle.numberPlate}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-all shrink-0" />
                                        </div>
                                    ))}

                                    {/* Render Plant & Equipment */}
                                    {clientPlants?.map(plant => (
                                        <div 
                                            key={plant.id}
                                            onClick={() => router.push(`/plants-equipment/${plant.id}`)}
                                            className="group p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between shadow-sm"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Hammer className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate">
                                                        {plant.name}
                                                    </p>
                                                    <Badge variant="outline" className="text-[9px] font-mono font-black mt-1 py-0 border-primary/20 text-primary bg-primary/5">
                                                        {plant.assetId}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-all shrink-0" />
                                        </div>
                                    ))}

                                    {(!clientVehicles || clientVehicles.length === 0) && (!clientPlants || clientPlants.length === 0) && (
                                        <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl opacity-40">
                                            <p className="text-sm font-medium italic">No technical assets registered to this account.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-muted-foreground px-2">
                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                        <History className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Service Interaction Log</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    {clientJobs && clientJobs.length > 0 ? (
                                        clientJobs.map(job => (
                                            <div 
                                                key={job.jobCardId} 
                                                className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-card hover:bg-muted/5 transition-all cursor-pointer group shadow-sm"
                                                onClick={() => router.push(`/job-cards/${job.jobCardId}`)}
                                            >
                                                <div className="flex items-center gap-5 min-w-0">
                                                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border/50 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                                        <Activity className="h-5 w-5" />
                                                    </div>
                                                    <div className="space-y-1 min-w-0">
                                                        <p className="text-xs font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate">
                                                            {job.reportedIssue}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            <span><FormattedDate date={job.createdAt} formatString="dd MMM yyyy" /></span>
                                                            <span className="opacity-30">•</span>
                                                            <span className="truncate">ID: {job.jobCardId.slice(-6)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <JobStatusBadge status={job.status} className="text-[8px] font-black uppercase shrink-0 ml-4" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center border-2 border-dashed rounded-3xl opacity-40">
                                            <p className="text-sm font-medium italic">No repair cycles detected for this account.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="communications" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
                            <RelatedCommunications 
                                customerId={params.customerId} 
                                onLogInteraction={() => setIsCommFormOpen(true)}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Account Metrics Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-border/50 bg-card premium-shadow">
                        <CardHeader className="bg-muted/30 border-b py-6 px-8">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Account Health</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-4 text-center sm:text-left">
                                <div className="space-y-1">
                                    <p className="text-3xl sm:text-4xl font-black tracking-tighter text-primary">{(clientVehicles?.length || 0) + (clientPlants?.length || 0)}</p>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Fleet Units</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-3xl sm:text-4xl font-black tracking-tighter text-indigo-500">{clientJobs?.length || 0}</p>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Jobs Logged</p>
                                </div>
                            </div>
                            
                            <Separator className="opacity-50" />
                            
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center sm:text-left">Fidelity Rating</h4>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-sm">
                                        <ShieldCheck className="h-8 w-8" />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-2xl font-black tracking-tighter text-amber-600">A+ Grade</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Trusted Registry Member</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl relative overflow-hidden group">
                                <Activity className="absolute -right-4 -bottom-4 h-16 w-16 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3" /> Technical Pulse
                                </h4>
                                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
                                    Account activity is optimal. Baseline established through multiple operational cycles.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 px-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Registry Date</span>
                            <span className="text-foreground font-black"><FormattedDate date={customer.createdAt} formatString="dd/MM/yyyy" /></span>
                        </div>
                        <Separator className="opacity-50" />
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Last Synchronization</span>
                            <span className="text-foreground font-black"><FormattedDate date={customer.updatedAt} formatString="dd/MM/yyyy" /></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] text-center">Makros System Client Registry • Internal Reference Classified</p>
            </div>

            {/* Interaction Modal */}
            <Dialog open={isCommFormOpen} onOpenChange={setIsCommFormOpen}>
                <DialogContent className="sm:max-w-[640px] p-0 border-border/50 overflow-hidden rounded-3xl shadow-2xl">
                    <DialogHeader className="p-8 border-b bg-muted/30">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                                <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Log Interaction</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Record a client conversation trace in the master registry.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <CommunicationForm 
                        onSubmit={handleLogInteraction} 
                        isSubmitting={isCommSubmitting} 
                        initialData={{
                            customerId: customer.customerId,
                            direction: 'Outgoing',
                            channel: 'Phone Call',
                            subject: `Interaction with ${customer.fullName}`,
                            toName: customer.fullName,
                            toRole: 'Customer'
                        } as any}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CustomerDetailsPage;
