'use client';

import React from 'react';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Pencil, Trash2, Eye, Download, Send, Printer, FileText, Loader2, FileCheck, FileDigit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDFDocument } from './invoice-pdf-document';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { JobPart } from '@/types/job-card';
import { WorkshopSettings } from '@/types/settings';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, DocumentReference } from 'firebase/firestore';

interface InvoiceActionsProps {
    invoice: Invoice;
    currentUserRole: string;
    onRecordPayment: (invoice: Invoice) => void;
    onCancel: (invoice: Invoice) => void;
    onEdit: (invoice: Invoice) => void;
    onPreview: (invoice: Invoice) => void;
}

/**
 * @fileOverview Technical Action Terminal for fiscal records.
 * Enhanced with specialized multi-title export commands and settlement indicators.
 */
export const InvoiceActions: React.FC<InvoiceActionsProps> = ({ 
    invoice, 
    currentUserRole, 
    onRecordPayment, 
    onCancel,
    onEdit,
    onPreview
}) => {
    const { toast } = useToast();
    const db = useFirestore();

    // Context for PDF Generation
    const custRef = useMemoFirebase(() => {
        if (!db || !invoice?.customerId) return null;
        return doc(db, 'customers', invoice.customerId);
    }, [db, invoice.customerId]);

    const jobRef = useMemoFirebase(() => {
        if (!db || !invoice?.jobCardId) return null;
        return doc(db, 'jobCards', invoice.jobCardId);
    }, [db, invoice.jobCardId]);

    const settingsRef = useMemoFirebase(() => {
        if (!db) return null;
        return doc(db, 'settings', 'workshop') as DocumentReference<WorkshopSettings>;
    }, [db]);
    
    const { data: customer } = useDoc<Customer>(custRef as any);
    const { data: jobCard } = useDoc<any>(jobRef as any);
    const { data: settings } = useDoc<WorkshopSettings>(settingsRef as any);

    const vehRef = useMemoFirebase(() => {
        if (!db || !jobCard?.vehicleId) return null;
        return doc(db, 'vehicles', jobCard.vehicleId);
    }, [db, jobCard?.vehicleId]);
    const { data: vehicle } = useDoc<Vehicle>(vehRef as any);

    const partsQuery = useMemoFirebase(() => {
        if (!db || !invoice?.jobCardId) return null;
        return query(
            collection(db, 'jobCards', invoice.jobCardId, 'partsUsed'),
            orderBy('createdAt', 'asc')
        );
    }, [db, invoice.jobCardId]);
    const { data: parts } = useCollection<JobPart>(partsQuery as any);

    const hasPermission = (allowedRoles: string[]) => {
        return allowedRoles.includes(currentUserRole);
    };

    const isCancelled = invoice.paymentStatus === 'Cancelled';
    const isPaid = invoice.paymentStatus === 'Paid';

    const handleSendEmail = () => {
        toast({
            title: "Transmission Queued",
            description: "Invoice has been scheduled for electronic delivery.",
        });
    };

    // Sequential File Naming Protocol
    const baseFileName = (invoice.invoiceNumber || `INV-${invoice.invoiceId.slice(-8)}`).toUpperCase();

    return (
        <div className="flex w-full max-w-full flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 no-print overflow-hidden">
            {hasPermission(['Makros System Owner', 'Accountant', 'Workshop Manager']) && (
                <Button 
                    className="w-full sm:w-auto h-10 px-2 sm:px-6 font-black uppercase tracking-wide sm:tracking-[0.2em] text-[9px] sm:text-[10px] rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] overflow-hidden"
                    onClick={() => onRecordPayment(invoice)} 
                    disabled={isCancelled || isPaid}
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> 
                    <span className="truncate">Record Payment</span>
                </Button>
            )}
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:w-auto h-10 px-2 sm:px-6 font-black uppercase tracking-wide sm:tracking-widest text-[9px] sm:text-[10px] rounded-xl bg-background border-border/50 hover:bg-muted overflow-hidden"
                    >
                        <span className="truncate">Ledger Actions</span> 
                        <MoreHorizontal className="ml-1 h-3.5 w-3.5 opacity-50 flex-shrink-0" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl p-2 w-72 shadow-2xl border-border/50">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Dossier Command</DropdownMenuLabel>
                    
                    <DropdownMenuItem onClick={() => onPreview(invoice)} className="rounded-lg gap-3 py-3 text-[10px] font-black uppercase tracking-widest">
                        <Eye className="h-4 w-4 text-primary" /> Inspect Dossier
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => window.print()} className="rounded-lg gap-3 py-3 text-[10px] font-black uppercase tracking-widest">
                        <Printer className="h-4 w-4 text-primary" /> Print Layout
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2" />
                    
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Export Registry</DropdownMenuLabel>

                    <DropdownMenuItem asChild className="rounded-lg gap-3 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                        <PDFDownloadLink 
                            document={<InvoicePDFDocument invoice={invoice} customer={customer} vehicle={vehicle} parts={parts} settings={settings} documentTitle="PROFORMA INVOICE" />} 
                            fileName={`PROFORMA_${baseFileName}.pdf`}
                        >
                            {({ loading }) => (
                                <div className="flex items-center gap-3">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 text-amber-500" />}
                                    <span>Export Proforma Invoice</span>
                                </div>
                            )}
                        </PDFDownloadLink>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-lg gap-3 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                        <PDFDownloadLink 
                            document={<InvoicePDFDocument invoice={invoice} customer={customer} vehicle={vehicle} parts={parts} settings={settings} documentTitle="TAX INVOICE" />} 
                            fileName={`TAX_${baseFileName}.pdf`}
                        >
                            {({ loading }) => (
                                <div className="flex items-center gap-3">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDigit className="h-4 w-4 text-indigo-500" />}
                                    <span>Export Tax Invoice</span>
                                </div>
                            )}
                        </PDFDownloadLink>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-lg gap-3 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                        <PDFDownloadLink 
                            document={<InvoicePDFDocument invoice={invoice} customer={customer} vehicle={vehicle} parts={parts} settings={settings} documentTitle="INVOICE" />} 
                            fileName={`${baseFileName}.pdf`}
                        >
                            {({ loading }) => (
                                <div className="flex items-center gap-3">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4 text-green-500" />}
                                    <span>Export Invoice</span>
                                </div>
                            )}
                        </PDFDownloadLink>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-lg gap-3 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                        <PDFDownloadLink 
                            document={<InvoicePDFDocument invoice={invoice} customer={customer} vehicle={vehicle} parts={parts} settings={settings} />} 
                            fileName={`PURE_${baseFileName}.pdf`}
                        >
                            {({ loading }) => (
                                <div className="flex items-center gap-3">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 text-primary" />}
                                    <span>Export Pure PDF</span>
                                </div>
                            )}
                        </PDFDownloadLink>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="my-2" />

                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Workflow & Sync</DropdownMenuLabel>

                    {hasPermission(['Makros System Owner', 'Accountant', 'Workshop Manager']) && (
                        <DropdownMenuItem onClick={() => onEdit(invoice)} className="rounded-lg gap-3 py-3 text-[10px] font-black uppercase tracking-widest">
                            <Pencil className="h-4 w-4 text-primary" /> Synchronize Record
                        </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={handleSendEmail} className="rounded-lg gap-3 py-3 text-[10px] font-black uppercase tracking-widest">
                        <Send className="h-4 w-4 text-primary" /> Send via Email
                    </DropdownMenuItem>
                    
                    {hasPermission(['Makros System Owner', 'Accountant', 'Workshop Manager']) && !isCancelled && (
                        <>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem 
                                className="rounded-lg gap-3 py-3 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive" 
                                onClick={() => onCancel(invoice)}
                            >
                                <Trash2 className="h-4 w-4" /> Cancel Record
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
