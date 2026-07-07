'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { 
    Wrench, 
    Package, 
    ArrowLeft, 
    FilePlus, 
    Trash2, 
    Edit, 
    Hash, 
    Clock, 
    User, 
    Car,
    ShieldCheck,
    CheckCircle2,
    Activity,
    Camera,
    Users,
    Loader2,
    Pencil,
    Lock,
    MoreHorizontal,
    Play,
    Check,
    MessageSquare,
    Download,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { LoadingState } from '@/components/shared/loading-state';
import { JobStatusBadge } from './job-status-badge';
import { AddJobTaskDialog } from './add-job-task-dialog';
import { EditJobTaskDialog } from './edit-job-task-dialog';
import { AddJobPartDialog } from './add-job-part-dialog';
import { JobCardPhotoUpload } from './job-card-photo-upload';
import { JobCard, JobTask, JobPart, JobCardStatus } from '@/types/job-card';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { StaffMember } from '@/types/staff';
import { WorkshopSettings } from '@/types/settings';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { updateJobStatus, removePartFromJobCardTransaction, updateJobCard, updateJobTaskStatus, deleteJobTask } from '@/services/job-cards-service';
import { generateInvoiceTransaction } from '@/services/invoices-service';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelatedCommunications } from '@/components/communications/related-communications';
import { CommunicationForm } from '@/components/communications/communication-form';
import { createCommunicationLog } from '@/services/communications-service';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { JobCardPDFDocument } from './job-card-pdf-document';

/**
 * @fileOverview Technical Repair Dossier.
 * Stabilized with useMemoFirebase for multi-registry real-time synchronization.
 */
export function JobCardDetails({ jobCardId }: { jobCardId: string }) {
    const { user: currentUser, role: currentRole } = useAuth();
    const db = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    // 1. Technical Streams (Stabilized)
    const jobRef = useMemoFirebase(() => {
        if (!db) return null;
        return doc(db, 'jobCards', jobCardId);
    }, [db, jobCardId]);
    
    const { data: jobCard, loading: jobLoading } = useDoc<JobCard>(jobRef as any);

    const tasksQuery = useMemoFirebase(() => {
        if (!db) return null;
        return query(collection(db, 'jobCards', jobCardId, 'tasks'), orderBy('createdAt', 'asc'));
    }, [db, jobCardId]);

    const partsQuery = useMemoFirebase(() => {
        if (!db) return null;
        return query(collection(db, 'jobCards', jobCardId, 'partsUsed'), orderBy('createdAt', 'asc'));
    }, [db, jobCardId]);
    
    const { data: tasks, loading: tasksLoading } = useCollection<JobTask>(tasksQuery as any);
    const { data: parts, loading: partsLoading } = useCollection<JobPart>(partsQuery as any);

    // 2. Contextual Registry Streams (Stabilized)
    const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'workshop'), [db]);
    const { data: settings } = useDoc<WorkshopSettings>(settingsRef as any);

    const custRef = useMemoFirebase(() => {
        if (!db || !jobCard?.customerId) return null;
        return doc(db, 'customers', jobCard.customerId);
    }, [db, jobCard?.customerId]);

    const vehRef = useMemoFirebase(() => {
        if (!db || !jobCard?.vehicleId) return null;
        return doc(db, 'vehicles', jobCard.vehicleId);
    }, [db, jobCard?.vehicleId]);

    const mechRef = useMemoFirebase(() => {
        if (!db || !jobCard?.assignedMechanicId) return null;
        return doc(db, 'users', jobCard.assignedMechanicId);
    }, [db, jobCard?.assignedMechanicId]);

    const { data: customer } = useDoc<Customer>(custRef as any);
    const { data: vehicle } = useDoc<Vehicle>(vehRef as any);
    const { data: mechanic } = useDoc<StaffMember>(mechRef as any);

    // 3. Fiscal Intake Overrides
    const [applyTax, setApplyTax] = useState(false);
    const [applyDiscount, setApplyDiscount] = useState(false);

    // Synchronize toggle defaults once settings load
    useEffect(() => {
        if (settings) {
            setApplyTax(settings.taxEnabled || false);
        }
    }, [settings]);

    const [isRemovingPart, setIsRemovingPart] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editLaborCost, setEditLaborCost] = useState<string>('');
    const [editIssue, setEditIssue] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [taskToEdit, setTaskToEdit] = useState<JobTask | null>(null);
    const [isCommFormOpen, setIsCommFormOpen] = useState(false);
    const [isCommSubmitting, setIsCommSubmitting] = useState(false);

    // Operational Rules Check
    const isOwner = currentRole === 'Makros System Owner';
    const isManager = currentRole === 'Workshop Manager';
    const isReceptionist = currentRole === 'Receptionist';
    const isMechanic = currentRole === 'Mechanic';
    const isAssignedMechanic = currentUser?.userId === jobCard?.assignedMechanicId;

    const canManageStructure = isOwner || isManager || isReceptionist;
    const canUpdate = canManageStructure || (isMechanic && isAssignedMechanic);

    const isLoading = jobLoading || tasksLoading || partsLoading;

    const totalPartsCost = parts?.reduce((sum, p) => sum + (p.quantityUsed * (p.unitPrice || 0)), 0) || 0;

    // Derived Preview Totals based on Overrides
    const previewGrandTotal = useMemo(() => {
        if (!jobCard) return 0;
        const subtotal = (jobCard.laborCost || 0) + totalPartsCost;
        const discountRate = applyDiscount ? (settings?.defaultDiscount || 0) / 100 : 0;
        const taxRate = applyTax ? (settings?.taxRate || 0) / 100 : 0;

        const discountVal = subtotal * discountRate;
        const subtotalAfterDiscount = subtotal - discountVal;
        const taxVal = subtotalAfterDiscount * taxRate;
        
        return subtotalAfterDiscount + taxVal;
    }, [jobCard, totalPartsCost, applyDiscount, applyTax, settings]);

    const openEdit = () => {
        if (jobCard && canUpdate) {
            setEditLaborCost(jobCard.laborCost.toString());
            setEditIssue(jobCard.reportedIssue);
            setIsEditOpen(true);
        }
    };
    
    const handleStatusTransition = async (status: JobCardStatus) => {
        if (!currentUser || !canUpdate) return;
        updateJobStatus(jobCardId, status, currentUser.userId);
        toast({ title: "Workflow Transition", description: `Operation state updated to ${status}.` });
    };

    const handleSaveEdit = async () => {
        if (!currentUser || !canUpdate) return;
        try {
            updateJobCard(jobCardId, {
                laborCost: parseFloat(editLaborCost),
                reportedIssue: editIssue
            }, currentUser.userId);
            setIsEditOpen(false);
            toast({ title: "Dossier Synchronized", description: "Technical record updated successfully." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Sync Failed", description: error.message });
        }
    };

    const handleGenerateInvoice = async () => {
        if (!currentUser || (!isManager && !isOwner && !isReceptionist)) return;
        setIsGenerating(true);
        try {
            const invoiceId = await generateInvoiceTransaction(jobCardId, currentUser.userId, {
                applyTax,
                applyDiscount
            });
            toast({ title: "Billing Generated", description: "Technical dossier transition to invoicing completed." });
            router.push(`/invoices/${invoiceId}`);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Billing Failed", description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRemovePart = async (partId: string) => {
        if (!currentUser || !canManageStructure) return;
        setIsRemovingPart(partId);
        try {
            await removePartFromJobCardTransaction(jobCardId, partId, currentUser.userId);
            toast({ title: "Allocation Revoked", description: "Stock has been restored to inventory." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Action Failed", description: error.message });
        } finally {
            setIsRemovingPart(null);
        }
    };

    const handleTaskStatus = (taskId: string, status: JobTask['status']) => {
        if (!currentUser || !canUpdate) return;
        updateJobTaskStatus(jobCardId, taskId, status, currentUser.userId);
        toast({ title: "Task Shifted", description: `Task marked as ${status}.` });
    };

    const handleTaskDelete = async (taskId: string) => {
        if (!currentUser || !canManageStructure) return;
        try {
            deleteJobTask(jobCardId, taskId, currentUser.userId);
            toast({ title: "Task Purged", description: "Record removed from repair roadmap." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Delete Failed", description: error.message });
        }
    };

    const handleLogInteraction = async (data: any) => {
        if (!customer) return;
        setIsCommSubmitting(true);
        try {
            await createCommunicationLog({
                ...data,
                jobCardId,
                customerId: jobCard?.customerId,
                vehicleId: jobCard?.vehicleId,
                toName: customer.fullName,
                toRole: 'Customer'
            }, jobCardId);
            setIsCommFormOpen(false);
            toast({ title: "Interaction Registered", description: "Technical note committed to registry." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Operation Failed", description: error.message });
        } finally {
            setIsCommSubmitting(false);
        }
    };

    if (isLoading) return <LoadingState />;
    if (!jobCard) return null;

    const canInvoice = [JobCardStatus.Completed, JobCardStatus.QualityCheck].includes(jobCard.status as any) && (isManager || isOwner || isReceptionist);
    const pdfFileName = `JobCard-${jobCardId.toUpperCase().slice(-8)}.pdf`;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-32">
            {!canUpdate && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-center gap-3 text-destructive">
                    <Lock className="h-4 w-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Read-Only Archive • Authorization required to modify this dossier.</p>
                </div>
            )}

            {/* Dossier Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 bg-muted/20 p-8 rounded-[2.5rem] border border-border/50">
                <div className="space-y-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.back()} 
                        className="-ml-3 h-8 text-[10px] font-black uppercase tracking-widest gap-2 text-muted-foreground hover:text-primary hover:bg-transparent"
                    >
                        <ArrowLeft className="h-3 w-3" /> Back
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                            <Hash className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-4xl font-black tracking-tighter uppercase font-headline text-foreground">Job Dossier #{jobCardId.toUpperCase().slice(-6)}</h2>
                                {canUpdate && (
                                    <Button variant="ghost" size="icon" onClick={openEdit} className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <JobStatusBadge status={jobCard.status} className="h-6 text-[9px]" />
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" /> Updated: <FormattedDate date={jobCard.updatedAt} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Button asChild variant="outline" className="flex-1 sm:flex-none h-12 px-8 font-black uppercase tracking-widest text-[10px] rounded-xl bg-background border-border/50 hover:bg-muted transition-all">
                        <PDFDownloadLink 
                            document={<JobCardPDFDocument jobCard={jobCard} customer={customer} vehicle={vehicle} tasks={tasks} parts={parts} mechanic={mechanic} settings={settings} />} 
                            fileName={pdfFileName}
                        >
                            {({ loading }) => (
                                <div className="flex items-center gap-2">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    <span>Export Roadmap</span>
                                </div>
                            )}
                        </PDFDownloadLink>
                    </Button>

                    {(isManager || isOwner || isReceptionist) && (
                        <Button 
                            onClick={handleGenerateInvoice} 
                            disabled={!canInvoice || isGenerating}
                            className="flex-1 sm:flex-none h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FilePlus className="h-4 w-4 mr-2" />}
                            Finalize Billing
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-8 space-y-10">
                    <Tabs defaultValue="roadmap" className="w-full">
                        <div className="bg-card border border-border/50 rounded-2xl p-1.5 mb-8 shadow-sm overflow-x-auto custom-scrollbar">
                            <TabsList className="bg-transparent h-auto gap-1 p-0 flex justify-start w-full min-w-max">
                                <TabsTrigger value="roadmap" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Technical Roadmap</TabsTrigger>
                                <TabsTrigger value="evidence" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Forensic Evidence</TabsTrigger>
                                <TabsTrigger value="communication" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Notes & Communication</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="roadmap" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
                             {/* Identification Matrix */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="rounded-3xl border-border/50 bg-card overflow-hidden shadow-sm">
                                    <CardHeader className="bg-muted/30 p-5 border-b">
                                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-primary" /> Ownership
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <Avatar className="h-12 w-12 ring-2 ring-primary/5">
                                            <AvatarFallback className="font-black text-xs bg-primary/10 text-primary uppercase">
                                                {customer?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-black text-sm uppercase tracking-tight truncate">{customer?.fullName || 'Registry Void'}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{customer?.phone}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="rounded-3xl border-border/50 bg-card overflow-hidden shadow-sm">
                                    <CardHeader className="bg-muted/30 p-5 border-b">
                                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                            <Car className="h-3.5 w-3.5 text-primary" /> Technical Asset
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0">
                                                <p className="font-black text-sm uppercase tracking-tight truncate">{vehicle?.make} {vehicle?.model}</p>
                                                <Badge variant="outline" className="text-[10px] font-mono font-black text-primary bg-primary/5 py-0 border-primary/10 rounded uppercase">
                                                    {vehicle?.numberPlate}
                                                </Badge>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase leading-none">Odometer</p>
                                                <p className="text-xs font-black mt-1">{vehicle?.mileage?.toLocaleString() || 0} KM</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* TECHNICAL TASKS SECTION */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl border-none relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                                    <div className="space-y-0.5 relative z-10">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                            <Wrench className="h-4 w-4" /> Technical Tasks
                                        </h3>
                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Active Repair Roadmap</p>
                                    </div>
                                    {canManageStructure && (
                                        <div className="relative z-10">
                                            <AddJobTaskDialog jobCardId={jobCardId} />
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    {tasks && tasks.length > 0 ? tasks.map(task => {
                                        const taskId = (task as any).id || task.jobTaskId;
                                        return (
                                            <div key={taskId} className="group relative flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-all shadow-sm">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center border transition-all",
                                                        task.status === 'Completed' ? "bg-green-500/10 text-green-600 border border-green-200" : "bg-muted border border-border/50 text-muted-foreground"
                                                    )}>
                                                        {task.status === 'Completed' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{task.taskDescription}</p>
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Allocation: {task.estimatedHours} Hours</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="outline" className={cn(
                                                        "text-[8px] font-black uppercase border-primary/10 bg-primary/5 text-primary",
                                                        task.status === 'Completed' && "bg-green-500/5 text-green-600 border-green-200"
                                                    )}>{task.status}</Badge>
                                                    
                                                    {canUpdate && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-xl p-1.5 w-48 shadow-xl">
                                                                <DropdownMenuItem onClick={() => handleTaskStatus(taskId, 'In Progress')} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                                                    <Play className="h-3.5 w-3.5 text-blue-500" /> Start
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleTaskStatus(taskId, 'Completed')} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                                                    <Check className="h-3.5 w-3.5 text-green-500" /> Finalize
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => setTaskToEdit(task)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                                                    <Edit className="h-3.5 w-3.5" /> Edit
                                                                </DropdownMenuItem>
                                                                {canManageStructure && (
                                                                    <DropdownMenuItem onClick={() => handleTaskDelete(taskId)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive">
                                                                        <Trash2 className="h-3.5 w-3.5" /> Purge
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                                            </div>
                                        );
                                    }) : (
                                        <div className="py-12 text-center border-2 border-dashed rounded-[2rem] opacity-30 bg-muted/5">
                                            <p className="text-sm font-medium italic text-muted-foreground">No technical tasks specified for this operation.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PARTS REGISTRY SECTION */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl border-none relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                                    <div className="space-y-0.5 relative z-10">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                            <Package className="h-4 w-4" /> Parts Registry
                                        </h3>
                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Material & Inventory Log</p>
                                    </div>
                                    {canManageStructure && (
                                        <div className="relative z-10">
                                            <AddJobPartDialog jobCardId={jobCardId} />
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    {parts && parts.length > 0 ? (
                                        <div className="grid gap-3">
                                            {parts.map(part => (
                                                <div key={(part as any).id} className="group relative flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-all shadow-sm">
                                                    <div className="flex items-center gap-5">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/5 text-primary">
                                                            <Package className="h-5 w-5" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                                                                {part.itemName || part.itemId}
                                                            </p>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                Qty: {part.quantityUsed} Units • <CurrencyFormat value={part.unitPrice} abbreviate /> / Unit
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-foreground"><CurrencyFormat value={(part.unitPrice || 0) * part.quantityUsed} /></p>
                                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Line Total</p>
                                                        </div>
                                                        {canManageStructure && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleRemovePart((part as any).id)}
                                                                disabled={isRemovingPart === (part as any).id}
                                                            >
                                                                {isRemovingPart === (part as any).id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center border-2 border-dashed rounded-[2rem] opacity-30 bg-muted/5">
                                            <p className="text-sm font-medium italic text-muted-foreground">Inventory consumption records are currently empty.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="evidence" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
                             {/* Documentation */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-muted-foreground px-2">
                                    <Camera className="h-4 w-4" />
                                    <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Forensic Documentation</h3>
                                </div>
                                <JobCardPhotoUpload jobCardId={jobCardId} />
                            </div>
                        </TabsContent>

                        <TabsContent value="communication" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
                            <div className="p-2">
                                <RelatedCommunications 
                                    jobCardId={jobCardId} 
                                    onLogInteraction={() => setIsCommFormOpen(true)}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Context */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card shadow-sm">
                        <CardHeader className="bg-muted/30 border-b p-6">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Lead Technician</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-sm">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black uppercase tracking-tight">{mechanic?.fullName || 'Personnel Unassigned'}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none">Authorization Sync active</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-slate-900 text-white shadow-2xl border-none">
                        <CardHeader className="bg-white/5 border-b border-white/10 p-6">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    <span>Labor Yield:</span>
                                    <span className="text-white"><CurrencyFormat value={jobCard.laborCost} /></span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    <span>Parts Equity:</span>
                                    <span className="text-white"><CurrencyFormat value={totalPartsCost} /></span>
                                </div>
                            </div>

                            <Separator className="bg-white/10" />

                            <div className="space-y-5 py-2">
                                <div className="flex items-center justify-between group">
                                    <div className="space-y-0.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors cursor-pointer">
                                            Apply Discount ({settings?.defaultDiscount || 0}%)
                                        </Label>
                                    </div>
                                    <Switch 
                                        checked={applyDiscount} 
                                        onCheckedChange={setApplyDiscount}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="space-y-0.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors cursor-pointer">
                                            Apply Tax ({settings?.taxRate || 0}%)
                                        </Label>
                                    </div>
                                    <Switch 
                                        checked={applyTax} 
                                        onCheckedChange={setApplyTax}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            </div>
                            
                            <Separator className="bg-white/10" />

                            <div className="flex justify-between items-center pt-2">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Certified Total</span>
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Final Ledger Estimate</p>
                                </div>
                                <span className="text-3xl font-black text-white tracking-tighter">
                                    <CurrencyFormat value={previewGrandTotal} />
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Execution Terminal */}
            {canUpdate && (
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t z-40 lg:left-72 shadow-2xl">
                    <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-8">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-primary">Operation Yield</p>
                                <p className="text-3xl font-black tracking-tighter leading-none text-foreground"><CurrencyFormat value={previewGrandTotal} /></p>
                            </div>
                            <Separator orientation="vertical" className="h-10 opacity-30" />
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground">Workflow Command</p>
                                <div className="flex gap-2">
                                    {jobCard.status === JobCardStatus.InProgress ? (
                                        <Button size="sm" onClick={() => handleStatusTransition(JobCardStatus.QualityCheck)} className="bg-purple-600 h-9 px-5 font-black uppercase text-[9px] rounded-xl shadow-lg transition-all hover:scale-105">Quality Check</Button>
                                    ) : jobCard.status === JobCardStatus.QualityCheck ? (
                                        <Button size="sm" onClick={() => handleStatusTransition(JobCardStatus.Completed)} className="bg-green-600 h-9 px-5 font-black uppercase text-[9px] rounded-xl shadow-lg transition-all hover:scale-105">Complete Bay Load</Button>
                                    ) : (
                                        <Button size="sm" onClick={() => handleStatusTransition(JobCardStatus.InProgress)} className="bg-primary h-9 px-5 font-black uppercase text-[9px] rounded-xl shadow-lg transition-all hover:scale-105">Resume Operation</Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Calibration Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
                    <DialogHeader className="px-6 pt-6 pb-2 text-left">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Dossier Calibration</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                      <div className="space-y-6 px-6 pb-6 pt-2">
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base Labor Yield (Ush)</Label>
                              <Input 
                                  type="number" 
                                  value={editLaborCost} 
                                  onChange={(e) => setEditLaborCost(e.target.value)}
                                  className="h-12 rounded-xl bg-muted/50 border-none font-black text-primary text-lg"
                              />
                          </div>
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Incident Description</Label>
                              <Textarea 
                                  value={editIssue} 
                                  onChange={(e) => setEditIssue(e.target.value)}
                                  className="min-h-[120px] rounded-xl bg-muted/50 border-none resize-none p-4 text-sm font-medium"
                              />
                          </div>
                      </div>
                    </DialogBody>
                    <DialogFooter className="p-6 border-t">
                        <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]" onClick={handleSaveEdit}>
                            Commit Calibration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Record a technical conversation trace linked to this job card.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <CommunicationForm 
                        onSubmit={handleLogInteraction} 
                        isSubmitting={isCommSubmitting} 
                        initialData={{
                            jobCardId,
                            customerId: jobCard?.customerId,
                            vehicleId: jobCard?.vehicleId,
                            direction: 'Internal',
                            channel: 'Internal Note',
                            subject: `Technical note for Job #${jobCardId.slice(-6).toUpperCase()}`,
                            module: 'Job Card'
                        } as any}
                    />
                </DialogContent>
            </Dialog>

            {taskToEdit && (
                <EditJobTaskDialog 
                    jobCardId={jobCardId}
                    task={taskToEdit}
                    isOpen={!!taskToEdit}
                    onOpenChange={(open) => !open && setTaskToEdit(null)}
                />
            )}
        </div>
    );
}
