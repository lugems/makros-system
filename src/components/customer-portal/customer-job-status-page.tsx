'use client';

import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/shared/loading-state';
import { FormattedDate } from '@/components/shared/formatted-date';
import { JobStatusBadge } from '@/components/job-cards/job-status-badge';
import { 
    Activity, 
    Wrench, 
    Package, 
    Camera, 
    ArrowRight, 
    CheckCircle2, 
    ShieldCheck,
    Clock,
    Hash,
    History,
    ChevronRight,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobCardPhotoUpload } from '@/components/job-cards/job-card-photo-upload';

/**
 * @fileOverview Technical tracking interface for customers.
 * Displays own repair dossiers, real-time status transitions, and forensic evidence.
 * Stabilized with useMemoFirebase for loop-resistant sync.
 */
export default function CustomerJobStatusPage() {
    const { user } = useAuth();
    const db = useFirestore();

    const jobsQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(
            collection(db, 'jobCards'), 
            where('customerId', '==', user.userId),
            orderBy('createdAt', 'desc')
        );
    }, [db, user?.userId]);

    const { data: jobCards, loading } = useCollection<any>(jobsQuery);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const activeJob = useMemo(() => {
        if (!jobCards) return null;
        if (selectedJobId) return jobCards.find(j => j.jobCardId === selectedJobId);
        return jobCards.find(j => !['Completed', 'Cancelled', 'Delivered', 'Paid'].includes(j.status)) || jobCards[0];
    }, [jobCards, selectedJobId]);

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-headline">Service Progress</h1>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Real-time Technical bay Tracking</p>
                </div>
            </header>

            {jobCards && jobCards.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Sidebar: History/List */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-3 text-muted-foreground px-2">
                            <History className="h-4 w-4" />
                            <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Dossier history</h3>
                        </div>
                        <div className="space-y-3">
                            {jobCards.map(job => (
                                <button 
                                    key={job.jobCardId}
                                    onClick={() => setSelectedJobId(job.jobCardId)}
                                    className={cn(
                                        "w-full text-left p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group",
                                        activeJob?.jobCardId === job.jobCardId 
                                            ? "border-primary bg-primary/[0.02] ring-1 ring-primary/20" 
                                            : "border-border/50 bg-card hover:border-primary/40 shadow-sm"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Hash className="h-3 w-3 text-primary/50" />
                                                <span className="text-[10px] font-mono font-black uppercase text-muted-foreground tracking-widest">
                                                    #{job.jobCardId.slice(-8).toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                                                {job.reportedIssue}
                                            </p>
                                        </div>
                                        <JobStatusBadge status={job.status} className="text-[8px] py-0.5" />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">
                                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> <FormattedDate date={job.createdAt} formatString="dd MMM yyyy" /></span>
                                        <ChevronRight className={cn("h-3 w-3 transition-transform", activeJob?.jobCardId === job.jobCardId && "translate-x-1 text-primary")} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Main: Details */}
                    <main className="lg:col-span-8 space-y-8">
                        {activeJob ? (
                            <>
                                <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-slate-900 text-white shadow-2xl relative animate-in slide-in-from-right-4 duration-500">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                                        <Activity className="h-64 w-64" />
                                    </div>
                                    <CardHeader className="p-10 pb-6 relative z-10">
                                        <div className="flex items-center gap-3 text-primary mb-4">
                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Live System Sync</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Operation Status</p>
                                                <h2 className="text-5xl font-black tracking-tighter uppercase font-headline text-primary">{activeJob.status}</h2>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Entry Timestamp</p>
                                                <p className="text-lg font-black text-white"><FormattedDate date={activeJob.createdAt} formatString="dd MMM yyyy" /></p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 pt-0 relative z-10">
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Diagnosis Log</p>
                                            <p className="text-sm font-medium leading-relaxed italic text-white/80">&quot;{activeJob.reportedIssue}&quot;</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Technical Documentation */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 text-muted-foreground px-2">
                                        <Camera className="h-4 w-4" />
                                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Forensic Evidence</h3>
                                    </div>
                                    <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-sm">
                                        <JobCardPhotoUpload jobCardId={activeJob.jobCardId} />
                                    </div>
                                </section>

                                {/* Roadmap */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 text-muted-foreground px-2">
                                        <Wrench className="h-4 w-4" />
                                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Technical Roadmap</h3>
                                    </div>
                                    <div className="grid gap-3">
                                        {activeJob.tasks?.map((task: any, idx: number) => (
                                            <div key={idx} className="bg-card p-5 rounded-2xl border border-border/50 flex items-center justify-between group hover:border-primary/40 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                                        task.status === 'Completed' ? "bg-green-500/10 text-green-600 border border-green-200" : "bg-muted border border-border/50 text-muted-foreground"
                                                    )}>
                                                        {task.status === 'Completed' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                                    </div>
                                                    <p className="text-xs font-black uppercase tracking-tight">{task.taskDescription}</p>
                                                </div>
                                                <Badge variant="outline" className="text-[8px] font-black uppercase">{task.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-20 border-2 border-dashed rounded-[3rem] opacity-30">
                                <Search className="h-12 w-12 mb-4" />
                                <p className="text-sm font-medium italic">Select a dossier from your history to view technical details.</p>
                            </div>
                        )}
                    </main>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed rounded-[3rem] opacity-40 bg-muted/5">
                    <div className="h-20 w-20 rounded-[2rem] bg-background border flex items-center justify-center mb-8 shadow-sm">
                        <ShieldCheck className="h-10 w-10 text-primary opacity-30" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-widest mb-2">No Service History</h3>
                    <p className="text-sm font-medium italic max-w-sm mx-auto leading-relaxed">
                        Your units have not undergone any certified repair cycles. New operations will appear here upon workshop intake.
                    </p>
                </div>
            )}
        </div>
    );
}
