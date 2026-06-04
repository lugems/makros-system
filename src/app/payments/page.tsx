'use client';

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMediaQuery } from '@/hooks/use-media-query';

import { Payment } from '@/types/payment';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/layout/page-header';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { LoadingState } from '@/components/shared/loading-state';

import { PaymentList } from '@/components/payments/payment-list';
import { ReceiptPreview } from '@/components/payments/receipt-preview';
import { RecordPaymentForm } from '@/components/payments/record-payment-form';
import { 
    Wallet, 
    Plus, 
    History, 
    TrendingUp, 
    Smartphone, 
    Banknote, 
    FileCheck,
    Search,
    ShieldAlert,
    Activity,
    CreditCard,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

/**
 * @fileOverview Technical Treasury terminal.
 * Polished UI with responsive Drawers and pop-out print previews.
 */
export default function PaymentsPage() {
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { toast } = useToast();
    const db = useFirestore();
    const router = useRouter();

    // Authorization Matrix
    const isAuthorizedToRead = useMemo(() => {
        if (!currentUser) return false;
        return ['Makros System Owner', 'Workshop Manager', 'Accountant', 'Receptionist'].includes(currentUser.role);
    }, [currentUser]);

    const isAuthorizedToCreate = useMemo(() => {
        if (!currentUser) return false;
        return ['Makros System Owner', 'Workshop Manager', 'Accountant', 'Receptionist'].includes(currentUser.role);
    }, [currentUser]);

    // Live Technical Streams (Stabilized)
    const paymentsQuery = useMemoFirebase(() => {
        if (!isAuthorizedToRead || !db) return null;
        return query(collection(db, 'payments'), orderBy('paidAt', 'desc'));
    }, [db, isAuthorizedToRead]);

    const invoicesQuery = useMemoFirebase(() => {
        if (!db) return null;
        return query(collection(db, 'invoices'), orderBy('issuedAt', 'desc'));
    }, [db]);

    const { data: payments, loading: payLoading } = useCollection<Payment>(paymentsQuery as any);
    const { data: invoices, loading: invLoading } = useCollection<Invoice>(invoicesQuery as any);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
    const [isRecordOpen, setIsRecordOpen] = useState(false);
    const [previewingPayment, setPreviewingPayment] = useState<Payment | null>(null);

    // Dynamic Treasury Metrics
    const stats = useMemo(() => {
        if (!payments) return { total: 0, todayCollections: 0, mmCollections: 0, cashCollections: 0 };
        const total = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
        
        const mmCollections = payments
            .filter(p => p.method === 'Mobile Money')
            .reduce((acc, p) => acc + (p.amount || 0), 0);
        
        const cashCollections = payments
            .filter(p => p.method === 'Cash')
            .reduce((acc, p) => acc + (p.amount || 0), 0);

        return { total, todayCollections: 0, mmCollections, cashCollections };
    }, [payments]);

    const filteredPayments = useMemo(() => {
        if (!payments) return [];
        return payments.filter(p => {
            const id = p.paymentId || (p as any).id;
            return id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.transactionRef && p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    }, [payments, searchTerm]);

    const selectedPayment = useMemo(() => {
        if (!payments || !selectedPaymentId) return null;
        return payments.find(p => (p.paymentId === selectedPaymentId || (p as any).id === selectedPaymentId)) || null;
    }, [payments, selectedPaymentId]);

    // Selection Logic: Auto-select first on desktop
    React.useEffect(() => {
        if (!isMobile && !selectedPaymentId && filteredPayments.length > 0) {
            setSelectedPaymentId(filteredPayments[0].paymentId || (filteredPayments[0] as any).id);
        }
    }, [filteredPayments, selectedPaymentId, isMobile]);

    if (authLoading || (isAuthorizedToRead && (payLoading || invLoading))) return <LoadingState />;

    if (!isAuthorizedToRead) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Access Restricted</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                        Treasury ledger access is limited to authorized accounting and management personnel.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8 gap-2">
                    Return to Command Center
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <PageHeader title="Treasury & Collections">
                {isAuthorizedToCreate && (
                    <Button onClick={() => setIsRecordOpen(true)} className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                        <Plus className="h-4 w-4" /> Record Settlement
                    </Button>
                )}
            </PageHeader>

            <div className={cn("space-y-8", isMobile && selectedPaymentId && "hidden")}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="dashboard-gradient-blue border-none text-white rounded-[2rem] shadow-xl overflow-hidden relative group">
                        <CardHeader className="pb-2 p-8">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" /> Total Liquidity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <p className='text-3xl font-black tracking-tighter'><CurrencyFormat value={stats.total} abbreviate /></p>
                            <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Cumulative Collection (Ush)</p>
                        </CardContent>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                    </Card>

                    <Card className="bg-card border-border/50 rounded-[2rem] shadow-sm group">
                        <CardHeader className="pb-2 p-8">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                                <History className="h-4 w-4 text-primary" /> Registry Load
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <p className='text-3xl font-black tracking-tighter text-primary'>{payments?.length || 0}</p>
                            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Settled Records</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border/50 rounded-[2rem] shadow-sm group">
                        <CardHeader className="pb-2 p-8">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-indigo-500" /> Digital Volume
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <p className='text-3xl font-black tracking-tighter text-indigo-600'><CurrencyFormat value={stats.mmCollections} abbreviate /></p>
                            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Mobile Money Flow</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border/50 rounded-[2rem] shadow-sm group">
                        <CardHeader className="pb-2 p-8">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                                <Banknote className="h-4 w-4 text-orange-500" /> Physical Assets
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <p className='text-3xl font-black tracking-tighter text-orange-600'><CurrencyFormat value={stats.cashCollections} abbreviate /></p>
                            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Manual Treasury</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-3xl">
                    <div className="relative flex-grow w-full lg:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search collection ID, reference, or client authority..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 bg-background h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm border-none font-medium"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                    <div className="md:col-span-4 lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <History className="h-3.5 w-3.5" /> Collection Ledger
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground/60">{filteredPayments.length} Records</span>
                        </div>
                        <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                            <PaymentList
                                payments={filteredPayments}
                                selectedPaymentId={selectedPaymentId}
                                onSelectPayment={(id) => setSelectedPaymentId(id)}
                            />
                        </div>
                    </div>

                    <div className="hidden md:block md:col-span-8 lg:col-span-9 sticky top-24">
                        {selectedPayment ? (
                            <ReceiptPreview 
                                payment={selectedPayment} 
                                onPreview={setPreviewingPayment}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[500px] bg-muted/20 border-2 border-dashed rounded-[3rem] p-10 text-center text-muted-foreground transition-all">
                                <div className="h-16 w-16 rounded-3xl bg-background/50 flex items-center justify-center mb-4 shadow-sm border border-border/50">
                                    <FileCheck className="h-8 w-8 opacity-20" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest opacity-50 mb-2">Treasury Inspector</h3>
                                <p className="text-xs font-medium italic opacity-40 leading-relaxed max-w-[240px] mx-auto">
                                    Select a settlement record from the ledger to view certified receipts and forensic transaction details.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print Layout Pop-out Dialog */}
            {previewingPayment && (
                <Dialog open={!!previewingPayment} onOpenChange={(o) => !o && setPreviewingPayment(null)}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                        <DialogTitle className="sr-only">Receipt Preview</DialogTitle>
                        <div className="relative">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setPreviewingPayment(null)}
                                className="absolute right-4 top-4 z-50 rounded-full bg-white/10 hover:bg-white/20 text-white no-print"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <ReceiptPreview payment={previewingPayment} isStandalone />
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <Drawer open={isMobile && !!selectedPaymentId} onOpenChange={(open) => !open && setSelectedPaymentId(null)}>
                <DrawerContent className="max-h-[92dvh] flex flex-col">
                    <DrawerHeader className="border-b shrink-0 px-8 py-6">
                        <DrawerTitle className="text-left font-black uppercase tracking-tight">Receipt Dossier</DrawerTitle>
                        <DrawerDescription className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Forensic breakdown and certified receipt for the selected entry.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {selectedPayment && (
                            <ReceiptPreview 
                                payment={selectedPayment} 
                                onPreview={setPreviewingPayment}
                            />
                        )}
                    </div>
                </DrawerContent>
            </Drawer>

            <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
                <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50 bg-background rounded-3xl">
                    <DialogHeader className="px-8 pt-8 pb-4 text-left border-b">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">Collection Entry</DialogTitle>
                    </DialogHeader>
                    <div className="flex min-h-0 flex-1 flex-col">
                        <RecordPaymentForm 
                            onSubmit={() => setIsRecordOpen(false)}
                            invoices={invoices?.filter(i => i.balance > 0) || []}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
