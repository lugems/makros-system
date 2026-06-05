'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Invoice } from '@/types/invoice';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { JobCard, JobPart } from '@/types/job-card';
import { Payment } from '@/types/payment';
import { WorkshopSettings } from '@/types/settings';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy, DocumentReference } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FormattedDate } from '@/components/shared/formatted-date';
import { CurrencyFormat } from '@/components/shared/currency-format';
import PaymentStatusBadge from './payment-status-badge';
import { InvoiceActions } from './invoice-actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Car, User, Clock, FileText, History, Fingerprint, Receipt, ShieldCheck, TrendingUp, Phone, CheckCircle2, ExternalLink, Package, Building2, MapPin, Mail, MessageSquare, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelatedCommunications } from '@/components/communications/related-communications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CommunicationForm } from '@/components/communications/communication-form';
import { createCommunicationLog } from '@/services/communications-service';
import { useToast } from '@/hooks/use-toast';

interface InvoiceDetailsProps {
    invoice: Invoice;
    onRecordPayment: () => void;
    onCancel: () => void;
    onEdit: (invoice: Invoice) => void;
    onPreview: (invoice: Invoice) => void;
}

export function InvoiceDetails({ 
    invoice, 
    onRecordPayment, 
    onCancel,
    onEdit,
    onPreview
}: InvoiceDetailsProps) {
    const db = useFirestore();
    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    // Context Resolution with Memoized Firebase Refs - Hardened to prevent runtime crashes
    const custRef = useMemoFirebase(() => {
        if (!db || !invoice?.customerId) return null;
        return doc(db, 'customers', invoice.customerId);
    }, [db, invoice?.customerId]);

    const jobRef = useMemoFirebase(() => {
        if (!db || !invoice?.jobCardId) return null;
        return doc(db, 'jobCards', invoice.jobCardId);
    }, [db, invoice?.jobCardId]);

    const settingsRef = useMemoFirebase(() => {
        if (!db) return null;
        return doc(db, 'settings', 'workshop') as DocumentReference<WorkshopSettings>;
    }, [db]);
    
    const { data: customer } = useDoc<Customer>(custRef as any);
    const { data: jobCard } = useDoc<JobCard>(jobRef as any);
    const { data: settings } = useDoc<WorkshopSettings>(settingsRef as any);

    const vehRef = useMemoFirebase(() => {
        if (!db || !jobCard?.vehicleId) return null;
        return doc(db, 'vehicles', jobCard.vehicleId);
    }, [db, jobCard?.vehicleId]);
    const { data: vehicle } = useDoc<Vehicle>(vehRef as any);

    // Detailed Parts Stream from associated Job Card
    const partsQuery = useMemoFirebase(() => {
        if (!db || !invoice?.jobCardId) return null;
        return query(
            collection(db, 'jobCards', invoice.jobCardId, 'partsUsed'),
            orderBy('createdAt', 'asc')
        );
    }, [db, invoice?.jobCardId]);
    const { data: parts } = useCollection<JobPart>(partsQuery as any);

    // Payments Stream
    const paymentsQuery = useMemoFirebase(() => {
        if (!db || !invoice?.invoiceId) return null;
        return query(
            collection(db, 'payments'), 
            where('invoiceId', '==', invoice.invoiceId),
            orderBy('paidAt', 'desc')
        );
    }, [db, invoice?.invoiceId]);
    const { data: payments } = useCollection<Payment>(paymentsQuery as any);

    const [isCommFormOpen, setIsCommFormOpen] = useState(false);
    const [isCommSubmitting, setIsCommSubmitting] = useState(false);

    const handleLogInteraction = async (data: any) => {
        if (!customer) return;
        setIsCommSubmitting(true);
        try {
            await createCommunicationLog({
                ...data,
                invoiceId: invoice.invoiceId,
                customerId: invoice.customerId,
                toName: customer.fullName,
                toRole: 'Customer'
            }, invoice.invoiceId);
            setIsCommFormOpen(false);
            toast({ title: "Interaction Logged", description: "Payment discussion trace registered." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Operation Failed", description: error.message });
        } finally {
            setIsCommSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-full min-w-0 overflow-hidden border-border bg-card shadow-2xl flex flex-col h-full min-h-[600px] rounded-[2.5rem] premium-shadow animate-in slide-in-from-right-4 duration-500">
            <CardHeader className="bg-muted/30 p-4 sm:p-8 border-b flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 shrink-0">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="h-3.5 w-3.5 text-primary" />
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">
                                {invoice.invoiceNumber || invoice.invoiceId}
                            </p>
                        </div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight text-foreground">Record Analysis</CardTitle>
                    </div>
                </div>
                <div className="text-right space-y-2 w-full sm:w-auto">
                    <PaymentStatusBadge status={invoice.paymentStatus} className="text-[10px] font-black uppercase px-4 py-1.5 shadow-md" />
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                        Issue Date: <FormattedDate date={invoice.issuedAt} formatString="dd MMM yyyy" />
                    </p>
                </div>
            </CardHeader>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                <div className="bg-card border-b border-border/50 p-1.5 shadow-sm overflow-x-auto custom-scrollbar no-print shrink-0 w-full max-w-full">
                    <TabsList className="bg-transparent h-auto gap-1 p-0 flex justify-start w-full min-w-0">
                        <TabsTrigger 
                            value="overview" 
                            className="min-w-0 flex-1 truncate px-2 sm:px-8 py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl"
                        >
                            <span className="truncate">Financial Ledger</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="communication" 
                            className="min-w-0 flex-1 truncate px-2 sm:px-8 py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl"
                        >
                            <span className="truncate">Communication</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1">
                    <TabsContent value="overview" className="m-0 focus-visible:outline-none animate-in fade-in duration-500 w-full max-w-full min-w-0 overflow-hidden">
                        <CardContent className="p-4 sm:p-8 space-y-10">
                            {/* Action Row - Mobile safe, no overflow */}
                            <div className="no-print w-full max-w-full overflow-hidden">
                                <div className="flex w-full max-w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <Link
                                        href={`/invoices/${invoice.invoiceId}/preview`}
                                        target="_blank"
                                        className="block w-full max-w-full min-w-0 sm:w-auto sm:flex-shrink-0"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-10 w-full max-w-full min-0 overflow-hidden rounded-xl border border-primary/10 px-2 sm:px-6 text-[9px] sm:text-[10px] font-black uppercase tracking-wide sm:tracking-widest text-primary transition-all hover:bg-primary/5"
                                        >
                                            <ExternalLink className="mr-1 h-3.5 w-3.5 flex-shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
                                            <span className="min-w-0 truncate">Full Preview</span>
                                        </Button>
                                    </Link>

                                    <div
                                        className="w-full max-w-full min-w-0 overflow-hidden sm:flex-1"
                                    >
                                        <InvoiceActions 
                                            invoice={invoice} 
                                            currentUserRole={currentUser?.role || ''}
                                            onRecordPayment={onRecordPayment}
                                            onCancel={onCancel}
                                            onEdit={onEdit}
                                            onPreview={onPreview}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-12 text-foreground">
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Fiscal Recipient</h3>
                                    </div>
                                    <div className="pl-9 space-y-1.5">
                                        <p className="font-black text-xl leading-none uppercase tracking-tight">{customer?.fullName || 'Registry Void'}</p>
                                        <p className="text-sm font-bold text-muted-foreground pt-1 flex items-center gap-2">
                                            <Phone className="h-3 w-3 text-primary/60" /> {customer?.phone}
                                        </p>
                                        <p className="text-[11px] font-medium text-muted-foreground/60 italic flex items-center gap-2 truncate">
                                            <Mail className="h-3 w-3 text-primary/40" /> {customer?.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 text-muted-foreground md:justify-end">
                                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                            <Building2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Certified Issuer</h3>
                                    </div>
                                    <div className="md:text-right pl-9 md:pl-0 space-y-1.5">
                                        {settings?.logoUrl && (
                                            <div className="flex justify-end mb-2">
                                                <div className="relative h-12 w-32">
                                                    <Image 
                                                        src={settings.logoUrl} 
                                                        alt="Workshop Logo" 
                                                        fill 
                                                        className="object-contain object-right" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <p className="font-black text-xl leading-none uppercase tracking-tight text-primary">
                                            {settings?.workshopName || 'MAKROS SYSTEM'}
                                        </p>
                                        {settings?.businessRegistrationName && (
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">{settings.businessRegistrationName}</p>
                                        )}
                                        {settings?.tin && (
                                            <p className="text-[9px] font-mono font-bold text-primary/60 uppercase tracking-widest mt-1">TIN: {settings.tin}</p>
                                        )}
                                        <div className="space-y-1 pt-2">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center md:justify-end gap-2">
                                                <MapPin className="h-3 w-3 text-primary/40" /> {settings?.address || 'KAMPALA, UGANDA'}
                                            </p>
                                            <div className="flex flex-wrap items-center md:justify-end gap-2 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                                                <Phone className="h-3 w-3 text-primary/30" /> 
                                                <span>{settings?.phone}</span>
                                                {settings?.additionalPhones?.map((p, i) => (
                                                    <span key={i}>| {p}</span>
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap items-center md:justify-end gap-2 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                                                <Mail className="h-3 w-3 text-primary/30" /> 
                                                <span>{settings?.email}</span>
                                                {settings?.additionalEmails?.map((e, i) => (
                                                    <span key={i}>| {e}</span>
                                                ))}
                                            </div>
                                            {settings?.website && (
                                                <p className="text-[9px] font-bold text-primary/40 uppercase tracking-[0.2em] flex items-center md:justify-end gap-2">
                                                    <Globe className="h-3 w-3 text-primary/20" /> {settings.website}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="opacity-50" />

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                        <Receipt className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Line Item Ledger</h3>
                                </div>
                                <div className="rounded-[1.5rem] border overflow-x-auto shadow-sm bg-card/50">
                                    <table className="w-full text-sm min-w-[600px]">
                                        <thead className="bg-muted/30">
                                            <tr className="text-left text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em]">
                                                <th className="p-5">Technical Description</th>
                                                <th className="p-5 text-center">Qty</th>
                                                <th className="p-5 text-right">Unit Price</th>
                                                <th className="p-5 text-right">Total ({settings?.currency || 'Ush'})</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-foreground">
                                            <tr className="hover:bg-muted/10 transition-colors">
                                                <td className="p-5">
                                                    <span className="font-black uppercase tracking-tight">Labor & Diagnostic Charges</span>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">Service fees for repair and maintenance cycles.</p>
                                                </td>
                                                <td className="p-5 text-center font-bold">1</td>
                                                <td className="p-5 text-right font-bold"><CurrencyFormat value={invoice.laborTotal} /></td>
                                                <td className="p-5 text-right font-black"><CurrencyFormat value={invoice.laborTotal} /></td>
                                            </tr>
                                            {parts && parts.length > 0 ? (
                                                parts.map((part) => {
                                                    const partId = (part as any).id || part.jobPartId;
                                                    return (
                                                        <tr key={partId} className="hover:bg-muted/10 transition-colors">
                                                            <td className="p-5">
                                                                <span className="font-black uppercase tracking-tight">{part.itemName || part.itemId}</span>
                                                                <p className="text-[10px] text-muted-foreground mt-0.5">Inventory Part Allocation</p>
                                                            </td>
                                                            <td className="p-5 text-center font-bold">{part.quantityUsed}</td>
                                                            <td className="p-5 text-right font-bold"><CurrencyFormat value={part.unitPrice} /></td>
                                                            <td className="p-5 text-right font-black"><CurrencyFormat value={(part.unitPrice || 0) * part.quantityUsed} /></td>
                                                        </tr>
                                                    );
                                                })
                                            ) : null}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <div className="w-full max-w-sm space-y-4 bg-muted/20 p-4 sm:p-8 rounded-[2rem] border border-border/50 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 transition-transform group-hover:rotate-45">
                                        <TrendingUp className="h-32 w-32" />
                                    </div>
                                    
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground relative z-10">
                                        <span>Subtotal</span>
                                        <span className="text-foreground font-black"><CurrencyFormat value={invoice.laborTotal + invoice.partsTotal} /></span>
                                    </div>

                                    {invoice.discount > 0 && (
                                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-green-600 relative z-10">
                                            <span>Certified Discount</span>
                                            <span className="font-black">-<CurrencyFormat value={invoice.discount} /></span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground relative z-10">
                                        <span>Tax Provision</span>
                                        <span className="text-foreground font-black"><CurrencyFormat value={invoice.tax} /></span>
                                    </div>
                                    <Separator className="bg-border/40 relative z-10" />
                                    <div className="flex justify-between items-end pt-1 relative z-10 flex-wrap gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Certified Total</span>
                                        <span className="text-3xl font-black text-primary tracking-tighter leading-none"><CurrencyFormat value={invoice.grandTotal} /></span>
                                    </div>
                                    
                                    <div className="mt-6 bg-slate-900 p-5 rounded-2xl shadow-xl relative overflow-hidden group/balance border-none">
                                        <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-white/5 rounded-full blur-xl transition-all group-hover/balance:scale-150" />
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 leading-none">Account Balance</span>
                                                <p className="text-[8px] font-bold text-white/20 uppercase">Pending Settlement</p>
                                            </div>
                                            <span className={cn(
                                                "text-2xl font-black tracking-tighter",
                                                invoice.balance > 0 ? 'text-white' : 'text-green-400'
                                            )}>
                                                <CurrencyFormat value={invoice.balance} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {payments && payments.length > 0 && (
                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                            <History className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Transaction Trace</h3>
                                    </div>
                                    <div className="grid gap-4 pl-0 sm:pl-4">
                                        {payments.map(payment => (
                                            <div key={payment.paymentId} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-border/50 bg-background hover:border-primary/40 transition-all text-foreground group relative overflow-hidden gap-4">
                                                <div className="space-y-1 relative z-10">
                                                    <p className="font-black text-xs uppercase tracking-tight group-hover:text-primary transition-colors">{payment.method} Settlement</p>
                                                    <div className="flex items-center gap-2">
                                                        <Fingerprint className="h-3 w-3 text-primary opacity-40" />
                                                        <p className="text-[9px] text-muted-foreground font-mono font-bold uppercase tracking-tighter">REF: {payment.transactionRef || 'SYSTEM_VERIFIED'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right relative z-10">
                                                    <p className="font-black text-primary text-base leading-none"><CurrencyFormat value={payment.amount} /></p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1.5">
                                                        <FormattedDate date={payment.paidAt} formatString="dd MMM yyyy • HH:mm" />
                                                    </p>
                                                </div>
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </TabsContent>

                    <TabsContent value="communication" className="m-0 focus-visible:outline-none animate-in fade-in duration-500 w-full max-w-full min-w-0 overflow-hidden">
                        <div className="p-4 sm:p-8">
                            <RelatedCommunications 
                                invoiceId={invoice.invoiceId} 
                                onLogInteraction={() => setIsCommFormOpen(true)}
                            />
                        </div>
                    </TabsContent>
                </ScrollArea>
            </Tabs>
            
            <div className="bg-muted/30 px-8 py-5 border-t flex items-center justify-center shrink-0">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.6em] text-center">Makros System Financial Registry • Certified Record Analysis Active</p>
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
                                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Record a billing or payment interaction linked to this invoice.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <CommunicationForm 
                        onSubmit={handleLogInteraction} 
                        isSubmitting={isCommSubmitting} 
                        initialData={{
                            invoiceId: invoice.invoiceId,
                            customerId: invoice.customerId,
                            direction: 'Outgoing',
                            channel: 'WhatsApp',
                            subject: `Payment follow-up for Record #${invoice.invoiceNumber || invoice.invoiceId.slice(-6)}`,
                            module: 'Invoicing'
                        } as any}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
