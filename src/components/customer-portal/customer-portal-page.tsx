'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/loading-state';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { JobStatusBadge } from '@/components/job-cards/job-status-badge';
import { 
    Car, 
    Calendar, 
    Activity, 
    FileText, 
    ArrowRight, 
    Sparkles, 
    ShieldCheck, 
    AlertCircle,
    Clock,
    History,
    Bell,
    Wrench,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';

/**
 * @fileOverview Client-side entry for the Customer Dashboard.
 * Utilizes useMemoFirebase to stabilize ownership-gated queries.
 */
export default function CustomerPortalPage() {
    const { user } = useAuth();
    const db = useFirestore();

    // Technical Streams (Stabilized & Gated by Auth UID)
    const vehiclesQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(collection(db, 'vehicles'), where('customerId', '==', user.userId));
    }, [db, user?.userId]);

    const bookingsQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(collection(db, 'bookings'), where('customerId', '==', user.userId), orderBy('bookingDate', 'desc'));
    }, [db, user?.userId]);

    const jobsQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(collection(db, 'jobCards'), where('customerId', '==', user.userId), orderBy('createdAt', 'desc'));
    }, [db, user?.userId]);

    const invoicesQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(collection(db, 'invoices'), where('customerId', '==', user.userId));
    }, [db, user?.userId]);

    const commQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(
            collection(db, 'communicationLogs'), 
            where('customerId', '==', user.userId),
            where('isCustomerVisible', '==', true),
            orderBy('createdAt', 'desc'),
            limit(3)
        );
    }, [db, user?.userId]);

    const { data: vehicles, loading: vLoading } = useCollection<any>(vehiclesQuery);
    const { data: bookings, loading: bLoading } = useCollection<any>(bookingsQuery);
    const { data: jobCards, loading: jLoading } = useCollection<any>(jobsQuery);
    const { data: invoices, loading: iLoading } = useCollection<any>(invoicesQuery);
    const { data: messages } = useCollection<any>(commQuery);

    const isLoading = vLoading || bLoading || jLoading || iLoading;

    // Intelligence Metrics
    const metrics = useMemo(() => {
        const activeJob = jobCards?.find(j => !['Completed', 'Cancelled', 'Delivered', 'Paid'].includes(j.status));
        const nextBooking = bookings?.find(b => b.status === 'Confirmed');
        const balance = invoices?.reduce((sum, inv) => sum + (inv.balance || 0), 0) || 0;
        const openInquiries = messages?.filter(m => m.status === 'Open').length || 0;

        return { activeJob, nextBooking, balance, openInquiries };
    }, [jobCards, bookings, invoices, messages]);

    if (isLoading) return <LoadingState />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-primary h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Digital Service Dossier</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-headline">
                    Hello, <span className="text-primary">{user?.fullName.split(' ')[0]}</span>
                </h1>
                <p className="text-muted-foreground font-medium max-w-xl">
                    Welcome to your technical command center. Monitor your vehicle&apos;s repair status, manage service windows, and review certified billing.
                </p>
            </header>

            {/* Critical Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="dashboard-gradient-blue border-none text-white rounded-[2rem] shadow-xl overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Active Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black tracking-tight truncate">
                            {metrics.activeJob ? metrics.activeJob.status : 'No Active Repair'}
                        </p>
                        <p className="text-[9px] font-bold uppercase mt-1 opacity-70">Workshop progress log</p>
                    </CardContent>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                </Card>

                <Card className="bg-card border-border/50 rounded-[2rem] shadow-sm group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" /> My Inquiries
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black tracking-tighter text-primary">
                            {metrics.openInquiries} Active
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Pending Support Responses</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 rounded-[2rem] shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-500" /> Next Intake
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black tracking-tight text-indigo-600">
                            {metrics.nextBooking ? <FormattedDate date={metrics.nextBooking.bookingDate} formatString="dd MMM" /> : 'TBD'}
                        </p>
                        <p className="text-[9px] font-bold uppercase mt-1 opacity-70">Confirmed service window</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 rounded-[2rem] shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileText className="h-4 w-4 text-orange-500" /> Fiscal Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black tracking-tighter text-orange-600">
                            <CurrencyFormat value={metrics.balance} />
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Outstanding collections</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Active Repair Dossier */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <History className="h-3.5 w-3.5" /> Technical Interaction history
                            </h3>
                            <Link href="/customer-portal/job-status">
                                <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest gap-2">
                                    Full Trace <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                        
                        <div className="space-y-3">
                            {jobCards && jobCards.length > 0 ? jobCards.slice(0, 3).map(job => (
                                <div key={job.jobCardId} className="bg-muted/10 p-6 rounded-[2rem] border border-border/50 flex flex-col sm:flex-row justify-between items-center gap-6 group hover:bg-muted/20 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-2xl bg-background border flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                            <Wrench className="h-6 w-6 text-primary/50" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tight leading-none mb-2">{job.reportedIssue.slice(0, 50)}...</p>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> <FormattedDate date={job.createdAt} formatString="dd MMM yyyy" /></span>
                                                <span className="opacity-30">•</span>
                                                <span>Dossier: {job.jobCardId.slice(-6)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <JobStatusBadge status={job.status} className="text-[8px] font-black px-4 py-1" />
                                </div>
                            )) : (
                                <div className="py-12 text-center border-2 border-dashed rounded-[2rem] opacity-30">
                                    <p className="text-sm font-medium italic">No repair history recorded.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* Recent Inbox Messages */}
                    <Card className="rounded-[2.5rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow">
                        <CardHeader className="bg-muted/30 border-b px-8 py-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                                <Bell className="h-4 w-4 text-primary" /> Inbox
                            </CardTitle>
                            <Link href="/customer-portal/messages">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                    <ArrowRight className="h-4 w-4 opacity-40" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {messages && messages.length > 0 ? messages.map(msg => (
                                <div key={msg.logId} className="space-y-2 relative pl-4 border-l-2 border-primary/20 group cursor-pointer" onClick={() => router.push('/customer-portal/messages')}>
                                    <p className="text-xs font-black uppercase tracking-tight group-hover:text-primary transition-colors">{msg.subject}</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed italic line-clamp-2">
                                        &quot;{msg.message}&quot;
                                    </p>
                                    <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">
                                        <FormattedDate date={msg.createdAt} formatString="dd MMM, HH:mm" />
                                    </p>
                                </div>
                            )) : (
                                <div className="py-6 text-center opacity-30 italic text-xs">
                                    Queue clear. No new interactions.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Support Intelligence */}
                    <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <ShieldCheck className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Technical Assurance
                        </h4>
                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
                            Your technical records are forensic-grade and digitally certified. All labor is backed by a 30-day workshop warranty.
                        </p>
                    </div>
                </div>
            </div>

            <footer className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center rounded-[2.5rem]">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.6em]">Makros System Client Portal • Authorized Access Certified</p>
            </footer>
        </div>
    );
}
