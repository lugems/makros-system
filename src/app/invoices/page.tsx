'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMediaQuery } from '@/hooks/use-media-query';

import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Plus, FileText, AlertCircle, Receipt, Wallet, History, X, ShieldAlert } from 'lucide-react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/layout/page-header';

import InvoiceSummaryCard from '@/components/invoices/invoice-summary-card';
import InvoiceFilters from '@/components/invoices/invoice-filters';
import { InvoiceList } from '@/components/invoices/invoice-list';
import { InvoiceDetails } from '@/components/invoices/invoice-details';
import GenerateInvoiceDialog from '@/components/invoices/generate-invoice-dialog';
import RecordPaymentDialog from '@/components/invoices/record-payment-dialog';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { LoadingState } from '@/components/shared/loading-state';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import InvoicePreview from '@/components/invoices/invoice-preview';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { cancelInvoice, updateInvoiceMetadata } from '@/services/invoices-service';

export default function InvoicesPage() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { toast } = useToast();
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const db = useFirestore();
    const router = useRouter();

    // Authorization Gate
    const isAuthorized = useMemo(() => {
        if (!currentUser) return false;
        return ['Makros System Owner', 'Workshop Manager', 'Accountant', 'Receptionist'].includes(currentUser.role);
    }, [currentUser]);

    // Live Data Streams - Stabilized with useMemoFirebase
    const invoicesQuery = useMemoFirebase(() => {
        if (!isAuthorized || !db) return null;
        return query(collection(db, 'invoices'), orderBy('issuedAt', 'desc'));
    }, [db, isAuthorized]);

    const { data: invoices, loading: invLoading } = useCollection<Invoice>(invoicesQuery as any);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [isPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [previewingInvoice, setPreviewingInvoice] = useState<Invoice | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Dynamic Metrics
    const metrics = useMemo(() => {
        if (!invoices) return { total: 0, collected: 0, outstanding: 0, pendingCount: 0 };
        let total = 0;
        let collected = 0;
        let pendingCount = 0;

        invoices.forEach(inv => {
            total += inv.grandTotal || 0;
            collected += inv.amountPaid || 0;
            if (inv.paymentStatus !== 'Paid' && inv.paymentStatus !== 'Cancelled') {
                pendingCount++;
            }
        });

        return {
            total,
            collected,
            outstanding: Math.max(0, total - collected),
            pendingCount
        };
    }, [invoices]);

    const filteredInvoices = useMemo(() => {
        if (!invoices) return [];
        let filtered = [...invoices];

        if (statusFilter !== 'All') {
            filtered = filtered.filter(inv => inv.paymentStatus === statusFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(inv => 
                inv.invoiceNumber?.toLowerCase().includes(q) ||
                inv.invoiceId.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [invoices, searchQuery, statusFilter]);

    // Reset pagination on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredInvoices.slice(startIndex, startIndex + pageSize);
    }, [filteredInvoices, currentPage, pageSize]);

    const selectedInvoice = useMemo(() => {
        return invoices?.find(inv => inv.invoiceId === selectedInvoiceId) || null;
    }, [invoices, selectedInvoiceId]);

    // Set initial selection (Desktop only)
    useEffect(() => {
        if (!isMobile && !selectedInvoiceId && filteredInvoices.length > 0) {
            setSelectedInvoiceId(filteredInvoices[0].invoiceId);
        }
    }, [filteredInvoices, selectedInvoiceId, isMobile]);

    const handleCancelInvoice = (invoiceToCancel: Invoice) => {
        if (!currentUser) return;
        cancelInvoice(invoiceToCancel.invoiceId, currentUser.userId);
        toast({ title: "Invoice Cancelled", description: "The billing record has been marked as Cancelled in the ledger." });
    };

    const handleUpdateInvoiceMetadata = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingInvoice && currentUser) {
            updateInvoiceMetadata(editingInvoice.invoiceId, {
                issuedAt: editingInvoice.issuedAt,
                dueDate: editingInvoice.dueDate,
                notes: editingInvoice.notes
            }, currentUser.userId);
            setEditingInvoice(null);
            toast({ title: "Record Synchronized", description: "Financial record metadata updated successfully." });
        }
    };

    if (authLoading || (isAuthorized && invLoading)) return <LoadingState />;

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Access Restricted</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                        Financial ledger access is limited to authorized accounting and management personnel.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8">
                    Return to Command
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <PageHeader title="Revenue & Billing">
                <Button onClick={() => setIsGenerateOpen(true)} className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" /> New Invoice
                </Button>
            </PageHeader>

            <div className={cn("space-y-8", isMobile && selectedInvoiceId && "hidden")}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <InvoiceSummaryCard 
                        title="Total Billed" 
                        value={<CurrencyFormat value={metrics.total} abbreviate />} 
                        icon={<FileText className="h-4 w-4" />}
                        trend="Gross Revenue"
                        gradient="blue"
                    />
                    <InvoiceSummaryCard 
                        title="Collections" 
                        value={<CurrencyFormat value={metrics.collected} abbreviate />} 
                        icon={<Wallet className="h-4 w-4 text-green-500" />} 
                        trend="Net Realized"
                        gradient="green"
                    />
                    <InvoiceSummaryCard 
                        title="Outstanding" 
                        value={<CurrencyFormat value={metrics.outstanding} abbreviate />} 
                        icon={<AlertCircle className="h-4 w-4 text-destructive" />} 
                        trend="Awaiting Payment"
                        gradient="orange"
                    />
                    <InvoiceSummaryCard 
                        title="Active Balances" 
                        value={metrics.pendingCount.toString()} 
                        icon={<History className="h-4 w-4 text-indigo-500" />} 
                        trend="Pending Cycle"
                    />
                </div>

                <InvoiceFilters
                    onSearch={setSearchQuery}
                    onFilterStatus={setStatusFilter}
                    onFilterDate={() => {}}
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    <div className="md:col-span-4 lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Receipt className="h-3.5 w-3.5" /> Ledger Registry
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground/60">{filteredInvoices.length} Records</span>
                        </div>
                        <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                            <InvoiceList
                                invoices={paginatedInvoices}
                                selectedInvoiceId={selectedInvoiceId}
                                onSelectInvoice={setSelectedInvoiceId}
                            />
                        </div>
                        <DataTablePagination 
                            totalItems={filteredInvoices.length}
                            pageSize={pageSize}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                        />
                    </div>

                    <div className="hidden md:block md:col-span-8 lg:col-span-9 sticky top-24">
                        {selectedInvoice ? (
                            <InvoiceDetails 
                                invoice={selectedInvoice} 
                                onRecordPayment={() => setIsRecordPaymentOpen(true)}
                                onCancel={() => handleCancelInvoice(selectedInvoice)}
                                onEdit={(inv) => setEditingInvoice(inv)}
                                onPreview={setPreviewingInvoice}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[500px] bg-muted/20 border-2 border-dashed rounded-[2.5rem] p-10 text-center text-muted-foreground transition-all">
                                <div className="h-16 w-16 rounded-3xl bg-background/50 flex items-center justify-center mb-4 shadow-sm border border-border/50">
                                    <FileText className="h-8 w-8 opacity-20" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest opacity-50 mb-2">Billing Inspector</h3>
                                <p className="text-xs font-medium italic opacity-40 leading-relaxed max-w-[240px] mx-auto">
                                    Select a billing record from the ledger to perform technical audits and manage payments.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isGenerateOpen && (
                <GenerateInvoiceDialog 
                    isOpen={isGenerateOpen} 
                    onClose={() => setIsGenerateOpen(false)}
                />
            )}

            {isPaymentOpen && selectedInvoice && (
                <RecordPaymentDialog 
                    invoice={selectedInvoice}
                    isOpen={isPaymentOpen}
                    onClose={() => setIsRecordPaymentOpen(false)}
                    invoices={invoices || []}
                />
            )}

            {/* Edit Metadata Dialog */}
            <Dialog open={!!editingInvoice} onOpenChange={(o) => !o && setEditingInvoice(null)}>
                <DialogContent className="sm:max-w-[480px] rounded-[2rem] bg-background text-foreground border-border/50">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Financial Record Sync</DialogTitle>
                        <DialogDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Modify metadata for Record #{editingInvoice?.invoiceId.slice(-6).toUpperCase()}</DialogDescription>
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

            {previewingInvoice && (
                <Dialog open={!!previewingInvoice} onOpenChange={(o) => !o && setPreviewingInvoice(null)}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                        <DialogTitle className="sr-only">Invoice Preview</DialogTitle>
                        <DialogDescription className="sr-only">Forensic print preview for the selected billing record.</DialogDescription>
                        <div className="relative">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setPreviewingInvoice(null)}
                                className="absolute right-4 top-4 z-50 rounded-full bg-white/10 hover:bg-white/20 text-white no-print"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <InvoicePreview invoice={previewingInvoice} />
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <Drawer open={isMobile && !!selectedInvoiceId} onOpenChange={(open) => !open && setSelectedInvoiceId(null)}>
                <DrawerContent>
                    <DrawerHeader className="border-b shrink-0">
                        <DrawerTitle className="text-left font-black uppercase tracking-tight">Invoice Dossier</DrawerTitle>
                        <DrawerDescription className="sr-only">Comprehensive technical overview and status history for this financial record.</DrawerDescription>
                    </DrawerHeader>
                    {selectedInvoice && (
                        <InvoiceDetails 
                            invoice={selectedInvoice}
                            onRecordPayment={() => setIsRecordPaymentOpen(true)}
                            onCancel={() => handleCancelInvoice(selectedInvoice)}
                            onEdit={(inv) => setEditingInvoice(inv)}
                            onPreview={setPreviewingInvoice}
                        />
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}
