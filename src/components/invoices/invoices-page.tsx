'use client';

import React, { useState, useMemo } from 'react';
import useMakrosStore from '@/store/makros-store';
import { useMediaQuery } from '@/hooks/use-media-query';

import { Invoice } from '@/types/invoice';
import { Payment } from '@/types/payment';
import { calculateInvoiceTotals } from '@/lib/invoice-calculations';

import { Button } from '@/components/ui/button';
import { Plus, FileText, AlertCircle, Receipt, Wallet, History, Activity, TrendingUp, X } from 'lucide-react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/layout/page-header';

import InvoiceSummaryCard from './invoice-summary-card';
import InvoiceFilters from './invoice-filters';
import { InvoiceList } from './invoice-list';
import { InvoiceDetails } from './invoice-details';
import GenerateInvoiceDialog from './generate-invoice-dialog';
import RecordPaymentDialog from './record-payment-dialog';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { JobCardStatus } from '@/types/job-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InvoicePreview from './invoice-preview';

interface SummaryStats {
    totalInvoices: number;
    totalValue: number;
    totalPaid: number;
    balanceDue: number;
    Paid: number;
    Unpaid: number;
    'Partially Paid': number;
    Overdue: number;
    Cancelled: number;
}

const InvoicesPage: React.FC = () => {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { toast } = useToast();

    const { 
        invoices, customers, vehicles, jobCards, currentUser,
        addInvoice, addPayment, updateInvoice, updateJobCard 
    } = useMakrosStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

    const [isGenerateInvoiceOpen, setIsGenerateInvoiceOpen] = useState(false);
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [previewingInvoice, setPreviewingInvoice] = useState<Invoice | null>(null);

    const summaryStats: SummaryStats = useMemo(() => {
        let totalValue = 0;
        let totalPaid = 0;
        const counts: Record<string, number> = { Paid: 0, Unpaid: 0, 'Partially Paid': 0, Overdue: 0, Cancelled: 0 };

        invoices.forEach(invoice => {
            const { grandTotal, amountPaid, paymentStatus } = calculateInvoiceTotals(invoice);
            totalValue += grandTotal;
            totalPaid += amountPaid;
            if (counts[paymentStatus] !== undefined) {
                counts[paymentStatus]++;
            }
        });
        
        return {
            totalInvoices: invoices.length,
            totalValue,
            totalPaid,
            balanceDue: Math.max(0, totalValue - totalPaid),
            ...counts
        } as SummaryStats;
    }, [invoices]);

    const filteredInvoices = useMemo(() => {
        let filtered = [...invoices];

        if (statusFilter !== 'All') {
            filtered = filtered.filter(inv => calculateInvoiceTotals(inv).paymentStatus === statusFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(invoice => {
                const customer = customers.find(c => c.customerId === invoice.customerId);
                const vehicle = vehicles.find(v => v.customerId === invoice.customerId);
                return (
                    invoice.invoiceId.toLowerCase().includes(q) ||
                    (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(q)) ||
                    (customer?.fullName.toLowerCase().includes(q)) ||
                    (vehicle?.numberPlate.toLowerCase().includes(q))
                );
            });
        }

        return filtered.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    }, [invoices, searchQuery, statusFilter, customers, vehicles]);

    const selectedInvoice = useMemo(() => {
        return invoices.find(inv => inv.invoiceId === selectedInvoiceId) || null;
    }, [invoices, selectedInvoiceId]);

    const handleGenerateInvoice = (generatedInvoice: Invoice) => {
        addInvoice(generatedInvoice);
        const relatedJobCard = jobCards.find(jc => jc.jobCardId === generatedInvoice.jobCardId);
        if (relatedJobCard) {
            updateJobCard({ ...relatedJobCard, status: JobCardStatus.Invoiced });
        }
        setIsGenerateInvoiceOpen(false);
        setSelectedInvoiceId(generatedInvoice.invoiceId);
        toast({ title: "Invoice Generated", description: `Successfully created ${generatedInvoice.invoiceNumber || generatedInvoice.invoiceId}` });
    };

    const handleRecordPayment = (payment: Payment) => {
        addPayment(payment);
        setIsRecordPaymentOpen(false);
        toast({ title: "Payment Recorded", description: `Successfully added settlement of ${payment.amount.toLocaleString()} Ush.` });
    };

    const handleCancelInvoice = (invoiceToCancel: Invoice) => {
        updateInvoice({ ...invoiceToCancel, paymentStatus: 'Cancelled' });
        toast({ title: "Invoice Cancelled", description: "The billing record has been marked as Cancelled." });
    };

    const handleUpdateInvoiceMetadata = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingInvoice) {
            updateInvoice(editingInvoice);
            setEditingInvoice(null);
            toast({ title: "Record Synchronized", description: "Financial record metadata updated successfully." });
        }
    };

    const canGenerate = ['Makros System Owner', 'Workshop Manager', 'Accountant'].includes(currentUser?.role || '');

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <PageHeader title="Revenue & Billing">
                {canGenerate && (
                    <Button onClick={() => setIsGenerateInvoiceOpen(true)} className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> New Invoice
                    </Button>
                )}
            </PageHeader>

            {/* Collection Ledger & Analysis */}
            <div className={cn("space-y-8", isMobile && selectedInvoiceId && "hidden")}>
                {/* Collection Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <InvoiceSummaryCard 
                        title="Total Billed" 
                        value={<CurrencyFormat value={summaryStats.totalValue} abbreviate />} 
                        icon={<FileText className="h-4 w-4" />}
                        trend="Gross Revenue"
                        gradient="blue"
                    />
                    <InvoiceSummaryCard 
                        title="Collections" 
                        value={<CurrencyFormat value={summaryStats.totalPaid} abbreviate />} 
                        icon={<Wallet className="h-4 w-4 text-green-500" />} 
                        trend="Net Realized"
                        gradient="green"
                    />
                    <InvoiceSummaryCard 
                        title="Outstanding" 
                        value={<CurrencyFormat value={summaryStats.balanceDue} abbreviate />} 
                        icon={<AlertCircle className="h-4 w-4 text-destructive" />} 
                        trend="Awaiting Payment"
                        gradient="orange"
                    />
                    <InvoiceSummaryCard 
                        title="Pending Cycle" 
                        value={summaryStats.Unpaid + summaryStats['Partially Paid']} 
                        icon={<History className="h-4 w-4 text-indigo-500" />} 
                        trend="Active Balances"
                    />
                </div>
                
                <InvoiceFilters
                    onSearch={setSearchQuery}
                    onFilterStatus={setStatusFilter}
                    onFilterDate={() => {}}
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Ledger Registry Sidebar */}
                    <div className="md:col-span-4 lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Receipt className="h-3.5 w-3.5" /> Ledger Registry
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground/60">{filteredInvoices.length} Records</span>
                        </div>
                        <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                            <InvoiceList
                                invoices={filteredInvoices}
                                selectedInvoiceId={selectedInvoiceId}
                                onSelectInvoice={(id) => setSelectedInvoiceId(id)}
                            />
                        </div>
                    </div>

                    {/* Billing Inspector Dossier */}
                    <div className="hidden md:block md:col-span-8 lg:col-span-9 sticky top-24">
                        {selectedInvoice ? (
                            <InvoiceDetails 
                                invoice={selectedInvoice} 
                                onRecordPayment={() => setIsRecordPaymentOpen(true)}
                                onCancel={() => handleCancelInvoice(selectedInvoice)}
                                onEdit={(inv) => setEditingInvoice(inv)}
                                onPreview={(inv) => setPreviewingInvoice(inv)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[500px] bg-muted/20 border-2 border-dashed rounded-[2.5rem] p-10 text-center text-muted-foreground transition-all">
                                <div className="h-16 w-16 rounded-3xl bg-background/50 flex items-center justify-center mb-4 shadow-sm border border-border/50">
                                    <FileText className="h-8 w-8 opacity-20" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest opacity-50 mb-2">Billing Inspector</h3>
                                <p className="text-xs font-medium italic opacity-40 leading-relaxed max-w-[240px] mx-auto">
                                    Select a billing record from the ledger to perform technical audits, manage payments, and generate certified receipts.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Invoice Dialog */}
            <Dialog open={!!editingInvoice} onOpenChange={(o) => !o && setEditingInvoice(null)}>
                <DialogContent className="sm:max-w-[480px] rounded-[2rem] bg-background text-foreground border-border/50">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Financial Record Sync</DialogTitle>
                        <DialogDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Modify metadata for Record #{editingInvoice?.invoiceId.slice(-6)}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateInvoiceMetadata} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Issued Date</Label>
                                <Input 
                                    type="date" 
                                    value={editingInvoice?.issuedAt?.split('T')[0] || ''} 
                                    onChange={(e) => setEditingInvoice(inv => inv ? { ...inv, issuedAt: e.target.value } : null)}
                                    className="rounded-xl h-11 bg-muted/50 border-none font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Due Date</Label>
                                <Input 
                                    type="date" 
                                    value={editingInvoice?.dueDate?.split('T')[0] || ''} 
                                    onChange={(e) => setEditingInvoice(inv => inv ? { ...inv, dueDate: e.target.value } : null)}
                                    className="rounded-xl h-11 bg-muted/50 border-none font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fiscal Notes</Label>
                            <Textarea 
                                value={editingInvoice?.notes || ''} 
                                onChange={(e) => setEditingInvoice(inv => inv ? { ...inv, notes: e.target.value } : null)}
                                className="rounded-xl min-h-[100px] bg-muted/50 border-none resize-none font-medium text-sm"
                                placeholder="Add payment terms or technical notes..."
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20">
                            Commit Changes
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={!!previewingInvoice} onOpenChange={(o) => !o && setPreviewingInvoice(null)}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                    <DialogTitle className="sr-only">Invoice Preview</DialogTitle>
                    <DialogDescription className="sr-only">Detailed breakdown and technical audit of the selected billing record.</DialogDescription>
                    <div className="relative">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setPreviewingInvoice(null)}
                            className="absolute right-4 top-4 z-50 rounded-full bg-white/10 hover:bg-white/20 text-white no-print"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        {previewingInvoice && <InvoicePreview invoice={previewingInvoice} />}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Responsive Mobile Drawer */}
            <Drawer open={isMobile && !!selectedInvoiceId} onOpenChange={(open) => !open && setSelectedInvoiceId(null)}>
                <DrawerContent>
                    <DrawerHeader className="border-b shrink-0">
                        <DrawerTitle className="text-left font-black uppercase tracking-tight">Invoice Dossier</DrawerTitle>
                        <DrawerDescription className="sr-only">Comprehensive technical overview and status history for this financial record.</DrawerDescription>
                    </DrawerHeader>
                    {selectedInvoiceId && selectedInvoice && (
                        <InvoiceDetails 
                            invoice={selectedInvoice}
                            onRecordPayment={() => setIsRecordPaymentOpen(true)}
                            onCancel={() => handleCancelInvoice(selectedInvoice)}
                            onEdit={(inv) => setEditingInvoice(inv)}
                            onPreview={(inv) => setPreviewingInvoice(inv)}
                        />
                    )}
                </DrawerContent>
            </Drawer>

            {canGenerate && (
                <GenerateInvoiceDialog
                    isOpen={isGenerateInvoiceOpen}
                    onClose={() => setIsGenerateInvoiceOpen(false)}
                    onGenerate={handleGenerateInvoice}
                />
            )}
            
            <RecordPaymentDialog
                invoice={selectedInvoice}
                isOpen={isRecordPaymentOpen}
                onClose={() => setIsRecordPaymentOpen(false)}
                onRecordPayment={handleRecordPayment}
            />
        </div>
    );
};

export default InvoicesPage;
