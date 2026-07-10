'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Payment } from '@/types/payment';
import { Invoice } from '@/types/invoice';
import { Customer } from '@/types/customer';
import { StaffMember } from '@/types/staff';
import { WorkshopSettings } from '@/types/settings';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, FileCheck, ShieldCheck, Mail, Phone, MapPin, Fingerprint, Receipt, User, History, ExternalLink, Globe, Loader2, FileText, Landmark, CreditCard, Binary } from 'lucide-react';
import PaymentStatusBadge from '@/components/invoices/payment-status-badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReceiptPDFDocument } from './receipt-pdf-document';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ReceiptPreviewProps {
    payment: Payment;
    isStandalone?: boolean;
    onPreview?: (payment: Payment) => void;
}

/**
 * @fileOverview High-fidelity Certified Payment Receipt Terminal.
 * Refined to support certified receipt numbers from the treasury registry.
 * Synchronized with the Midnight Slate theme.
 */
export function ReceiptPreview({ payment, isStandalone = false, onPreview }: ReceiptPreviewProps) {
    const db = useFirestore();
    const { toast } = useToast();

    // 1. Primary Record Resolution (Stabilized)
    const id = payment.paymentId || (payment as any).id;
    
    const custRef = useMemoFirebase(() => {
        if (!db || !payment?.customerId) return null;
        return doc(db, 'customers', payment.customerId);
    }, [db, payment?.customerId]);

    const invRef = useMemoFirebase(() => {
        if (!db || !payment?.invoiceId) return null;
        return doc(db, 'invoices', payment.invoiceId);
    }, [db, payment?.invoiceId]);

    const userRef = useMemoFirebase(() => {
        if (!db || !payment?.createdBy) return null;
        return doc(db, 'users', payment.createdBy);
    }, [db, payment?.createdBy]);
    
    // 2. Global Workshop Context
    const settingsRef = useMemoFirebase(() => {
        if (!db) return null;
        return doc(db, 'settings', 'workshop') as DocumentReference<WorkshopSettings>;
    }, [db]);

    const { data: customer } = useDoc<Customer>(custRef as any);
    const { data: invoice } = useDoc<Invoice>(invRef as any);
    const { data: recorder } = useDoc<StaffMember>(userRef as any);
    const { data: settings } = useDoc<WorkshopSettings>(settingsRef as any);

    const handlePrint = () => window.print();

    const workshop = settings || {
        workshopName: "MAKROS SYSTEM WORKSHOP",
        address: "KAMPALA, UGANDA",
        phone: "+256 000 000 000",
        email: "registry@makrossystem.com",
        currency: "UGX",
        receiptFooterNote: "Thank you for trusting Makros System Workshop."
    };

    const fileName = payment.receiptNumber 
        ? `${payment.receiptNumber}.pdf` 
        : `Receipt-${id.toUpperCase().slice(-8)}.pdf`;

    return (
        <Card className={cn(
            "overflow-hidden border-border bg-card shadow-2xl flex flex-col rounded-[2.5rem] premium-shadow animate-in slide-in-from-right-4 duration-500 h-full min-h-[600px]",
            isStandalone && "shadow-none border-none rounded-none"
        )}>
            {/* ACTION BAR: Dashboard/Details Mode */}
            {!isStandalone && (
                <div className="bg-muted/30 p-6 sm:p-8 border-b flex flex-col lg:flex-row items-center justify-between no-print shrink-0 gap-6">
                    <div className="flex items-center gap-4 w-full lg:auto">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                            <FileCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Receipt Dossier</h3>
                            <div className="flex items-center gap-2">
                                 <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                 <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Certified Trace Active</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                        <Button 
                            asChild
                            variant="ghost" 
                            size="sm" 
                            className="h-10 px-4 text-[9px] font-black uppercase tracking-widest gap-2 text-primary hover:bg-primary/5 rounded-xl border border-primary/10"
                        >
                            <Link href={`/payments/${id}/preview`}>
                                <ExternalLink className="h-3.5 w-3.5" /> Full Preview
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPreview?.(payment)}
                            className="h-10 px-6 rounded-xl border-border/50 bg-background font-black uppercase tracking-widest text-[9px]"
                        >
                            <Printer className="mr-2 h-4 w-4 opacity-50" />
                            Print Layout
                        </Button>

                        <Button asChild className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/20 cursor-pointer">
                            <PDFDownloadLink 
                                document={<ReceiptPDFDocument payment={payment} customer={customer} invoice={invoice} recorder={recorder} settings={settings} />} 
                                fileName={fileName}
                            >
                                {({ loading }) => (
                                    <>
                                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                                        <span>Export PDF</span>
                                    </>
                                )}
                            </PDFDownloadLink>
                        </Button>
                    </div>
                </div>
            )}

            <ScrollArea className="flex-1 bg-white dark:bg-slate-950/20 print:bg-white">
                <CardContent className="p-8 md:p-12 text-slate-900 dark:text-slate-100 receipt-document relative">
                    {/* ACTION BAR: Standalone/Full Preview Mode */}
                    {isStandalone && (
                        <div className="flex justify-between items-center mb-10 no-print">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary border border-primary/10">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Certified Record Sync Active</span>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" size="sm" onClick={handlePrint} className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-900">
                                    <Printer className="h-4 w-4" /> Print Layout
                                </Button>
                                
                                <Button asChild className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20 cursor-pointer text-white">
                                    <PDFDownloadLink 
                                        document={<ReceiptPDFDocument payment={payment} customer={customer} invoice={invoice} recorder={recorder} settings={settings} />} 
                                        fileName={fileName}
                                    >
                                        {({ loading }) => (
                                            <>
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                                <span>Export PDF</span>
                                            </>
                                        )}
                                    </PDFDownloadLink>
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-0 right-0 p-20 opacity-[0.02] rotate-12 pointer-events-none print:hidden">
                        <Receipt className="h-96 w-96" />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                {workshop.logoUrl ? (
                                    <div className="relative h-16 w-32 shrink-0">
                                        <Image src={workshop.logoUrl} alt="Logo" fill className="object-contain" />
                                    </div>
                                ) : (
                                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shrink-0">
                                        <Receipt className="h-8 w-8" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase font-headline text-slate-800 dark:text-white leading-none">
                                        {workshop.workshopName}
                                    </h2>
                                    {workshop.businessRegistrationName && (
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">{workshop.businessRegistrationName}</p>
                                    )}
                                    {workshop.tin && (
                                        <p className="text-[10px] font-mono font-black text-primary/60 uppercase mt-2">TIN: {workshop.tin}</p>
                                    )}
                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] mt-1">Technical Operations OS</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1">
                                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary/60" /> {workshop.address}</div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Phone className="h-4 w-4 text-primary/60" /> 
                                    <span>{workshop.phone}</span>
                                    {workshop.additionalPhones?.map((p, i) => (
                                        <span key={i} className="before:content-['|'] before:mr-2 before:opacity-30">{p}</span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Mail className="h-4 w-4 text-primary/60" /> 
                                    <span>{workshop.email}</span>
                                    {workshop.additionalEmails?.map((e, i) => (
                                        <span key={i} className="before:content-['|'] before:mr-2 before:opacity-30">{e}</span>
                                    ))}
                                </div>
                                {workshop.website && (
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-4 w-4 text-primary/60" />
                                        <span>{workshop.website}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-right space-y-6 w-full md:w-auto">
                            <div className="inline-block bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group border-none">
                                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700">
                                    <ShieldCheck className="h-20 w-20" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-3 relative z-10 text-center">Certified Settlement</p>
                                <p className="text-2xl font-black font-mono leading-none relative z-10 text-center text-primary uppercase">#{payment.receiptNumber || id.toUpperCase().slice(-12)}</p>
                                <div className="mt-4 flex justify-center relative z-10">
                                    <Badge className="bg-green-500/20 text-green-400 border-none px-4 py-1 text-[9px] font-black uppercase shadow-lg">Verified Cleared</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-12 opacity-50" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-slate-300">
                                <User className="h-4 w-4" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Fiscal Recipient</h4>
                            </div>
                            <div className="pl-6 border-l-2 border-slate-100">
                                <p className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{customer?.fullName || 'Registry Void'}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Contact: {customer?.phone || 'NO_AUTH_DATA'}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-slate-300 md:justify-end">
                                <Fingerprint className="h-4 w-4" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Ledger Synchronization</h4>
                            </div>
                            <div className="md:text-right pl-6 md:pl-0 space-y-3">
                                <div className="inline-flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Invoice Source</p>
                                        <p className="text-base font-black font-mono text-slate-700 dark:text-slate-300">#{invoice?.invoiceNumber || payment.invoiceId.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <History className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-16">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-900 dark:border-slate-100 text-left">
                                    <th className="py-5 text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Transaction Specification</th>
                                    <th className="py-5 text-right text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Settlement Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-10">
                                        <p className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Settlement of Certified Workshop Balance</p>
                                        <div className="flex flex-wrap items-center gap-6 mt-4">
                                            <Badge variant="outline" className="text-[10px] font-black border-primary/20 text-primary px-3 py-1 rounded-lg uppercase tracking-widest bg-primary/5">
                                                Channel: {payment.method}
                                            </Badge>
                                            {payment.transactionRef && (
                                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Auth ID:</span>
                                                    <span className="text-xs font-mono font-bold text-slate-500">{payment.transactionRef}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-10 text-right">
                                        <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                                            <CurrencyFormat value={payment.amount} />
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                        <div>
                            {workshop.bankName && (
                                <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                                        <Landmark className="h-4 w-4 text-primary" /> Payment Instructions
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bank Institution</p>
                                            <p className="text-sm font-black uppercase">{workshop.bankName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase opacity-60">{workshop.bankBranch}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Title</p>
                                            <p className="text-sm font-black uppercase">{workshop.bankAccountName}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account No</p>
                                                <p className="text-sm font-mono font-black">{workshop.bankAccountNumber}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SWIFT / BIC</p>
                                                <p className="text-sm font-mono font-black text-primary">{workshop.bankSwiftCode}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end space-y-6">
                            <div className="w-full md:w-80 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group/total border-none">
                                <div className="absolute -right-6 -bottom-6 h-40 w-40 bg-white/5 rounded-full blur-3xl group-hover/total:scale-150 transition-all duration-700" />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-6">
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Settled Balance</span>
                                        <span className="text-3xl font-black text-white tabular-nums"><CurrencyFormat value={payment.amount} /></span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Registry state</span>
                                        <div className="flex items-center gap-3 text-green-400">
                                            <ShieldCheck className="h-5 w-5" />
                                            <span className="text-sm font-black uppercase tracking-[0.2em]">CLEARED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-10 pt-16 border-t-2 border-dashed border-slate-100 dark:border-slate-800 relative">
                        <p className="text-sm font-medium text-slate-400 italic max-w-md mx-auto leading-relaxed px-6">
                            &quot;{workshop.receiptFooterNote}&quot;
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center items-center gap-16 md:gap-32 pt-6">
                            <div className="space-y-2 min-w-[200px]">
                                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300">Authorized Official</p>
                                <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{recorder?.fullName || 'Registry Administrator'}</p>
                                </div>
                            </div>
                            <div className="space-y-2 min-w-[200px]">
                                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300">Digital Validation</p>
                                <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-tighter">{id}</p>
                            </div>
                        </div>

                        <div className="pt-16">
                            <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.8em]">Makros System Treasury Control • Certified Record Classified</p>
                        </div>
                    </div>
                </CardContent>
            </ScrollArea>

            <style jsx global>{`
            @media print {
                .no-print { display: none !important; }
                .receipt-document {
                    box-shadow: none !important;
                    border: none !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 40px !important;
                    background: white !important;
                }
                body { background: white !important; padding: 0 !important; margin: 0 !important; }
                * { color: #0f172a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .dark { background: white !important; }
                .bg-slate-900 { background-color: #0f172a !important; color: white !important; }
                .text-white { color: white !important; }
                .text-primary { color: #3b82f6 !important; }
                .bg-primary { background-color: #3b82f6 !important; }
            }
        `}</style>
        </Card>
    );
}
