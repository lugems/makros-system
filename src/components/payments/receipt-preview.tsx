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
import { doc, DocumentReference, collection, query, orderBy } from 'firebase/firestore';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, FileCheck, ShieldCheck, Mail, Phone, MapPin, Fingerprint, Receipt, User, History, ExternalLink, Globe, Loader2, FileText, X, Landmark } from 'lucide-react';
import PaymentStatusBadge from '@/components/invoices/payment-status-badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReceiptPDFDocument } from './receipt-pdf-document';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PRINT_STYLES = `
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
        .bg-slate-900 { background-color: #0f172a !important; color: white !important; }
        .text-white { color: white !important; }
        .text-primary { color: #3b82f6 !important; }
        .bg-primary { background-color: #3b82f6 !important; }
    }
`;

interface ReceiptPreviewProps {
    payment: Payment;
    isStandalone?: boolean;
    onPreview?: (payment: Payment) => void;
    onClose?: () => void;
}

/**
 * @fileOverview High-fidelity Certified Payment Receipt Terminal.
 * Synchronized with Invoice module standards and professional naming protocols.
 */
export function ReceiptPreview({ payment, isStandalone = false, onPreview, onClose }: ReceiptPreviewProps) {
    const db = useFirestore();
    const { toast } = useToast();

    // 1. Primary Record Resolution (Stabilized)
    const id = payment?.paymentId || (payment as any)?.id;
    
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

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const workshop = settings || {
        workshopName: "MAKROS SYSTEM WORKSHOP",
        address: "KAMPALA, UGANDA",
        phone: "+256 000 000 000",
        email: "registry@makrossystem.com",
        website: "https://makrossystem.com",
        currency: "UGX",
        receiptFooterNote: "Thank you for trusting Makros System Workshop.",
        logoUrl: undefined,
        businessRegistrationName: undefined,
        tin: undefined,
        additionalPhones: [] as string[],
        additionalEmails: [] as string[],
        bankDetails: undefined,
    };

    // Sequential File Naming Protocol
    const pdfFileName = `${payment.receiptNumber || `PAY-${id?.slice(-8)}`}.pdf`.toUpperCase();

    return (
        <>
            <Card className={cn(
                "overflow-hidden border-border bg-card shadow-2xl flex flex-col rounded-2xl sm:rounded-[2.5rem] premium-shadow animate-in slide-in-from-right-4 duration-500 h-full min-h-[500px] w-full max-w-full",
                isStandalone && "shadow-none border-none rounded-none min-h-0"
            )}>
                {/* ACTION BAR: Dashboard/Details Mode */}
                {!isStandalone && (
                    <div className="bg-muted/30 p-4 sm:p-6 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between no-print shrink-0 gap-4 w-full">
                        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                                    <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-foreground leading-tight">Receipt Dossier</h3>
                                    <div className="flex items-center gap-1.5">
                                         <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                         <p className="text-[8px] sm:text-[9px] text-muted-foreground font-black uppercase tracking-widest">Certified Trace Active</p>
                                    </div>
                                </div>
                            </div>
                            {onClose && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={onClose} 
                                    className="h-8 w-8 rounded-lg sm:hidden text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                            <Button 
                                asChild
                                variant="ghost" 
                                size="sm" 
                                className="h-9 px-2.5 sm:px-4 text-[8px] sm:text-[9px] font-black uppercase tracking-wider sm:tracking-widest gap-1.5 text-primary hover:bg-primary/5 rounded-xl border border-primary/10 w-full sm:w-auto justify-center"
                            >
                                <Link href={`/payments/${id}/preview`}>
                                    <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                                    <span className="truncate">Preview</span>
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPreview?.(payment)}
                                className="h-9 px-2.5 sm:px-5 rounded-xl border-border/50 bg-background font-black uppercase tracking-wider sm:tracking-widest text-[8px] sm:text-[9px] gap-1.5 w-full sm:w-auto justify-center"
                            >
                                <Printer className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-60 shrink-0" />
                                <span className="truncate">Print</span>
                            </Button>

                            <Button asChild className="h-9 px-2.5 sm:px-5 rounded-xl font-black uppercase tracking-wider sm:tracking-widest text-[8px] sm:text-[9px] shadow-lg shadow-primary/20 cursor-pointer text-white w-full sm:w-auto justify-center">
                                <PDFDownloadLink 
                                    document={<ReceiptPDFDocument payment={payment} customer={customer} invoice={invoice} recorder={recorder} settings={settings} />} 
                                    fileName={pdfFileName}
                                >
                                    {({ loading }) => (
                                        <>
                                            {loading ? <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin mr-1.5 shrink-0" /> : <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 shrink-0" />}
                                            <span className="truncate">PDF</span>
                                        </>
                                    )}
                                </PDFDownloadLink>
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white dark:bg-slate-950/20 print:bg-white custom-scrollbar">
                    <CardContent className="p-4 sm:p-8 md:p-12 text-slate-900 dark:text-slate-100 receipt-document relative w-full max-w-full box-border">
                        {/* ACTION BAR: Standalone/Full Preview Mode */}
                        {isStandalone && (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10 no-print">
                                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Certified Record Sync Active</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                    <Button variant="outline" size="sm" onClick={handlePrint} className="h-9 sm:h-10 px-4 sm:px-6 rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-900 flex-1 sm:flex-none">
                                        <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Print Layout
                                    </Button>
                                    
                                    <Button asChild className="h-9 sm:h-10 px-4 sm:px-6 rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20 cursor-pointer text-white flex-1 sm:flex-none justify-center">
                                        <PDFDownloadLink 
                                            document={<ReceiptPDFDocument payment={payment} customer={customer} invoice={invoice} recorder={recorder} settings={settings} />} 
                                            fileName={pdfFileName}
                                        >
                                            {({ loading }) => (
                                                <>
                                                    {loading ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
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

                        <div className="flex flex-col md:flex-row justify-between items-start mb-10 sm:mb-16 gap-6 sm:gap-10">
                            <div className="space-y-4 sm:space-y-6 w-full md:max-w-[60%]">
                                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                    {workshop.logoUrl ? (
                                        <div className="relative h-12 w-24 sm:h-16 sm:w-32 shrink-0">
                                            <Image src={workshop.logoUrl} alt="Logo" fill className="object-contain" />
                                        </div>
                                    ) : (
                                        <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shrink-0">
                                            <Receipt className="h-6 w-6 sm:h-8 sm:w-8" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight uppercase font-headline text-slate-800 dark:text-white leading-tight break-words">
                                            {workshop.workshopName}
                                        </h2>
                                        {workshop.businessRegistrationName && (
                                            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest leading-snug mt-1 break-words">{workshop.businessRegistrationName}</p>
                                        )}
                                        {workshop.tin && (
                                            <p className="text-[9px] sm:text-[10px] font-mono font-black text-primary/70 uppercase mt-1">TIN: {workshop.tin}</p>
                                        )}
                                        <p className="text-[8px] sm:text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-1">Technical Operations OS</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 sm:space-y-2 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:tracking-[0.2em] pl-1 break-words">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" /> 
                                        <span className="break-words leading-relaxed">{workshop.address}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-primary/60 shrink-0" /> 
                                            <span>{workshop.phone}</span>
                                        </div>
                                        {workshop.additionalPhones?.map((p: string, i: number) => (
                                            <span key={i} className="before:content-['|'] before:mr-2 before:opacity-30">{p}</span>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 break-all">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-primary/60 shrink-0" /> 
                                            <span>{workshop.email}</span>
                                        </div>
                                        {workshop.additionalEmails?.map((e: string, i: number) => (
                                            <span key={i} className="before:content-['|'] before:mr-2 before:opacity-30">{e}</span>
                                        ))}
                                    </div>
                                    {workshop.website && (
                                        <div className="flex items-center gap-2.5 break-all">
                                            <Globe className="h-3.5 w-3.5 text-primary/60 shrink-0" /> <span>{workshop.website}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full md:w-auto text-left md:text-right">
                                <div className="w-full sm:w-auto inline-block bg-slate-900 text-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-xl relative overflow-hidden group border-none">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700 pointer-events-none">
                                        <ShieldCheck className="h-16 w-16 sm:h-20 sm:w-20" />
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-40 mb-2 sm:mb-3 relative z-10 text-center">Certified Settlement</p>
                                    <p className="text-xl sm:text-2xl font-black font-mono leading-none relative z-10 text-center text-primary uppercase break-all">
                                        #{payment.receiptNumber || id?.toUpperCase().slice(-12)}
                                    </p>
                                    <div className="mt-3 sm:mt-4 flex justify-center relative z-10">
                                        <Badge className="bg-green-500/20 text-green-400 border-none px-3 sm:px-4 py-1 text-[8px] sm:text-[9px] font-black uppercase shadow-lg">Verified Cleared</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="mb-8 sm:mb-12 opacity-50" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-16 mb-10 sm:mb-16">
                            <div className="space-y-3 sm:space-y-6">
                                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-300">
                                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Fiscal Recipient</h4>
                                </div>
                                <div className="pl-4 sm:pl-6 border-l-2 border-slate-200 dark:border-slate-800">
                                    <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight break-words">{customer?.fullName || 'Registry Void'}</p>
                                    <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest mt-1">Contact: {customer?.phone || 'NO_AUTH_DATA'}</p>
                                </div>
                            </div>
                            <div className="space-y-3 sm:space-y-6">
                                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-300 sm:justify-end">
                                    <Fingerprint className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Ledger Synchronization</h4>
                                </div>
                                <div className="sm:text-right pl-4 sm:pl-0 space-y-3">
                                    <div className="inline-flex items-center gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-900/50 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="text-left sm:text-right">
                                            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Invoice Source</p>
                                            <p className="text-sm sm:text-base font-black font-mono text-slate-700 dark:text-slate-300">#{invoice?.invoiceNumber || payment.invoiceId.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                                            <History className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10 sm:mb-16">
                            {/* Mobile Card Breakdown */}
                            <div className="block sm:hidden space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Transaction Specification</span>
                                    <p className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight mt-1">Settlement of Certified Workshop Balance</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                                    <Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary px-2.5 py-0.5 rounded-lg uppercase tracking-wider bg-primary/5">
                                        Channel: {payment.method}
                                    </Badge>
                                    {payment.transactionRef && (
                                        <div className="flex items-center gap-1.5 bg-background dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px]">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Auth:</span>
                                            <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{payment.transactionRef}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex justify-between items-baseline">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Amount</span>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                        <CurrencyFormat value={payment.amount} />
                                    </p>
                                </div>
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-slate-900 dark:border-slate-100 text-left">
                                            <th className="py-4 sm:py-5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400">Transaction Specification</th>
                                            <th className="py-4 sm:py-5 text-right text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400">Settlement Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <tr>
                                            <td className="py-6 sm:py-10">
                                                <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Settlement of Certified Workshop Balance</p>
                                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4">
                                                    <Badge variant="outline" className="text-[9px] sm:text-[10px] font-black border-primary/20 text-primary px-3 py-1 rounded-lg uppercase tracking-widest bg-primary/5">
                                                        Channel: {payment.method}
                                                    </Badge>
                                                    {payment.transactionRef && (
                                                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auth ID:</span>
                                                            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{payment.transactionRef}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-6 sm:py-10 text-right align-top sm:align-middle">
                                                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                                                    <CurrencyFormat value={payment.amount} />
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end mb-12 sm:mb-24 gap-6 sm:gap-8 items-stretch sm:items-start flex-col sm:flex-row flex-wrap lg:flex-nowrap">
                            {workshop.bankDetails && (
                                <div className="w-full flex-1 sm:min-w-[280px]">
                                    <div className="p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-dashed border-primary/20 bg-primary/[0.02]">
                                        <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-4 flex items-center gap-2">
                                            <Landmark className="h-3.5 w-3.5" /> Authorized Settlement Channels
                                        </p>
                                        <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
                                            {workshop.bankDetails}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="w-full sm:max-w-sm bg-slate-900 text-white p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-xl relative overflow-hidden group border-none shrink-0">
                                <div className="absolute -right-6 -bottom-6 h-40 w-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                                <div className="relative z-10 space-y-4 sm:space-y-6">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4 sm:pb-6 gap-4">
                                        <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/40">Total Disbursed</span>
                                        <span className="text-xl sm:text-3xl font-black text-white tabular-nums"><CurrencyFormat value={payment.amount} /></span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-primary">Registry state</span>
                                        <div className="flex items-center gap-2 sm:gap-3 text-green-400">
                                            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em]">CLEARED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-8 sm:space-y-10 pt-10 sm:pt-16 border-t-2 border-dashed border-slate-100 dark:border-slate-800 relative">
                            <p className="text-xs sm:text-sm font-medium text-slate-400 italic max-w-md mx-auto leading-relaxed px-4">
                                &quot;{workshop.receiptFooterNote}&quot;
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 md:gap-32 pt-4 sm:pt-6">
                                <div className="space-y-1.5 sm:space-y-2 min-w-[180px] sm:min-w-[200px] text-center">
                                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-slate-400 dark:text-slate-300">Authorized Official</p>
                                    <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5 sm:pb-2">
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">{recorder?.fullName || 'Registry Administrator'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 sm:space-y-2 min-w-[180px] sm:min-w-[200px] text-center">
                                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-slate-400 dark:text-slate-300">Digital Validation</p>
                                    <p className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 uppercase tracking-tight break-all">
                                        {payment.receiptNumber || id}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 sm:pt-16">
                                <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] sm:tracking-[0.8em]">Makros System Treasury Control • Certified Record Classified</p>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
            <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
        </>
    );
}
