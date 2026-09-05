'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import PaymentStatusBadge from '@/components/invoices/payment-status-badge';
import { 
    FileText, 
    Wallet, 
    Download, 
    History, 
    Fingerprint, 
    TrendingUp, 
    ShieldCheck,
    Receipt,
    Activity,
    Landmark,
    CreditCard,
    Binary
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

/**
 * @fileOverview High-fidelity Billing Dossier for customers.
 * Stabilized with useMemoFirebase for loop-resistant sync of financial records.
 * Features verified bank authority details for authorized settlements.
 */
export default function CustomerInvoicesPage() {
    const { user } = useAuth();
    const db = useFirestore();

    const invQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(
            collection(db, 'invoices'), 
            where('customerId', '==', user.userId),
            orderBy('issuedAt', 'desc')
        );
    }, [db, user?.userId]);

    const { data: invoices, loading } = useCollection<any>(invQuery);

    const metrics = useMemo(() => {
        if (!invoices) return { total: 0, paid: 0, outstanding: 0 };
        const total = invoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);
        const paid = invoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
        return { total, paid, outstanding: total - paid };
    }, [invoices]);

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-black uppercase tracking-tighter font-headline">Billing & Settlements</h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Certified Financial Ledger access</p>
            </header>

            {/* Fiscal Summary Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="dashboard-gradient-blue border-none text-white rounded-[2rem] shadow-xl overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Lifetime Billed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black tracking-tighter"><CurrencyFormat value={metrics.total} /></p>
                        <p className="text-[9px] font-bold uppercase mt-1 opacity-70">Total authorized service yield</p>
                    </CardContent>
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                </Card>

                <Card className="bg-card border-border/50 rounded-[2rem] shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-500" /> Verified Paid
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black tracking-tighter text-green-600"><CurrencyFormat value={metrics.paid} /></p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Realized fiscal settlements</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 rounded-[2rem] shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                            <Activity className="h-4 w-4 text-orange-500" /> Outstanding
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black tracking-tighter text-orange-600"><CurrencyFormat value={metrics.outstanding} /></p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Pending collection cycles</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <History className="h-3.5 w-3.5" /> Transaction Ledger history
                        </h3>
                    </div>

                    <div className="grid gap-4">
                        {invoices && invoices.length > 0 ? invoices.map(invoice => (
                            <div key={invoice.invoiceId} className="bg-card p-8 rounded-[2rem] border border-border/50 flex flex-col sm:flex-row justify-between items-center gap-8 group hover:border-primary/40 transition-all shadow-sm">
                                <div className="flex items-center gap-6">
                                    <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm shrink-0">
                                        <Receipt className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="font-black text-base uppercase tracking-tight leading-none text-foreground">Record #{invoice.invoiceNumber || invoice.invoiceId.slice(-6)}</p>
                                            <PaymentStatusBadge status={invoice.paymentStatus} className="text-[8px] h-5" />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
                                            Issued: <FormattedDate date={invoice.issuedAt} formatString="dd MMM yyyy" />
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-8 w-full sm:w-auto">
                                    <div className="text-right">
                                        <p className="text-xl font-black tracking-tight text-primary leading-none">
                                            <CurrencyFormat value={invoice.grandTotal} />
                                        </p>
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Total Authorized</p>
                                    </div>
                                    <Link href={`/invoices/${invoice.invoiceId}/preview`} target="_blank">
                                        <Button variant="outline" size="sm" className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest bg-background gap-2 w-full sm:w-auto shadow-sm">
                                            <Download className="h-3.5 w-3.5" /> PDF
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <div className="py-32 text-center border-2 border-dashed rounded-[3rem] opacity-30 flex flex-col items-center justify-center space-y-4">
                                <FileText className="h-12 w-12" />
                                <p className="text-sm font-medium italic">No financial traces detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border-none">
                        <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                            <Wallet className="h-4 w-4" /> Settlement methods
                        </h4>
                        <div className="space-y-5 relative z-10">
                            <p className="text-[11px] font-medium leading-relaxed italic text-white/70">
                                Makros System accepts certified settlements via Cash, Mobile Money, and authorized Bank Transfers.
                            </p>
                            <Separator className="bg-white/10" />
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <Landmark className="h-3 w-3" /> Bank Authority
                                    </p>
                                    <p className="text-[11px] font-black uppercase text-white tracking-tight">Stanbic Bank</p>
                                    <p className="text-[9px] font-bold text-white/60 uppercase">Garden City Branch</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Account Title</p>
                                    <p className="text-[11px] font-black uppercase text-white tracking-tight">MAKROS HOLDINGS UGANDA LIMITED</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard className="h-3 w-3" /> Account No
                                    </p>
                                    <p className="text-[11px] font-mono font-black text-primary tracking-widest">00000789564444</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <Binary className="h-3 w-3" /> SWIFT / BIC
                                    </p>
                                    <p className="text-[11px] font-mono font-black text-primary uppercase">SBICUGKX</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] border border-border/50 bg-card shadow-sm flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-muted flex items-center justify-center">
                            <Fingerprint className="h-8 w-8 opacity-20" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Certified Ledger Trace active</h4>
                    </div>
                </div>
            </div>

            <footer className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center rounded-[2.5rem]">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.6em]">Makros System Financial Analysis • Internal Ledger Classified</p>
            </footer>
        </div>
    );
}
