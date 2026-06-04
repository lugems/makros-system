'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { CommunicationLog } from '@/types/communication';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import { FormattedDate } from '@/components/shared/formatted-date';
import { 
    MessageSquare, 
    Plus, 
    History, 
    ShieldCheck, 
    User, 
    Clock, 
    Inbox,
    Activity,
    Info,
    Send,
    Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createCommunicationLog } from '@/services/communications-service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Client-side Interaction Ledger for customers.
 * Surfaces verified, client-facing communications from workshop personnel.
 */
export default function CustomerMessagesPage() {
    const { user } = useAuth();
    const db = useFirestore();
    const { toast } = useToast();

    // 1. Live Context Stream (Verified Client Visibility only)
    const logsQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(
            collection(db, 'communicationLogs'), 
            where('customerId', '==', user.userId),
            where('isCustomerVisible', '==', true),
            orderBy('createdAt', 'desc')
        );
    }, [db, user?.userId]);

    const { data: logs, loading } = useCollection<CommunicationLog>(logsQuery as any);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
    });

    const handleNewInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            await createCommunicationLog({
                subject: formData.subject,
                message: formData.message,
                channel: 'In-App',
                direction: 'Incoming',
                priority: 'Normal',
                status: 'Open',
                module: 'General',
                customerId: user.userId,
                isCustomerVisible: true,
                isInternalOnly: false,
                requiresFollowUp: true
            } as any, user.userId);

            toast({ title: "Inquiry Sent", description: "Your message has been registered in our technical log." });
            setIsDialogOpen(false);
            setFormData({ subject: '', message: '' });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Transmission Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-headline">Messages / Support</h1>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Verified Personnel Interactions</p>
                </div>
                <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="h-12 px-8 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 gap-3"
                >
                    <Plus className="h-4 w-4" /> Start New Inquiry
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-3 text-muted-foreground px-2">
                        <History className="h-4 w-4" />
                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Interaction Thread</h3>
                    </div>

                    <div className="grid gap-4">
                        {logs && logs.length > 0 ? logs.map(log => (
                            <Card key={log.logId} className="rounded-3xl border-border/50 bg-card overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center border",
                                                log.direction === 'Outgoing' ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border/50"
                                            )}>
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-tight text-foreground">{log.fromName || 'Makros Personnel'}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{log.fromRole || 'Staff'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase px-3 py-0.5 rounded-lg border-primary/20 text-primary bg-primary/5">{log.status}</Badge>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase mt-2 flex items-center justify-end gap-1.5">
                                                <Clock className="h-3 w-3 opacity-40" /> <FormattedDate date={log.createdAt} formatString="dd MMM, HH:mm" />
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{log.subject}</h4>
                                        <div className="bg-muted/10 p-6 rounded-2xl border border-dashed border-border/50">
                                            <p className="text-sm font-medium leading-relaxed italic text-foreground/80">&quot;{log.message}&quot;</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
                                        <ShieldCheck className="h-3.5 w-3.5" /> Certified Interaction Trace • Ref: {log.logId.slice(-8).toUpperCase()}
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="py-32 text-center border-2 border-dashed rounded-[3rem] opacity-30 flex flex-col items-center justify-center space-y-4">
                                <Inbox className="h-12 w-12" />
                                <p className="text-sm font-medium italic">No messages or support traces detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <Activity className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <Info className="h-4 w-4" /> Response Protocol
                        </h4>
                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
                            Our technical staff monitor all portal inquiries during standard operating hours. Urgent matters linked to active job cards receive prioritized routing.
                        </p>
                    </div>

                    <Card className="rounded-[2.5rem] border-border/50 bg-slate-900 text-white p-8 shadow-2xl relative overflow-hidden border-none">
                        <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/5 rounded-full blur-3xl" />
                        <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Thread Density
                        </CardTitle>
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-4xl font-black tracking-tighter">{logs?.length || 0}</p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Total Traces</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-4xl font-black tracking-tighter text-green-400">
                                        {logs?.filter(l => l.status === 'Resolved').length || 0}
                                    </p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Resolved</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* New Inquiry Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
                    <DialogHeader className="px-6 pt-6 pb-2 text-left">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Initialize Inquiry</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Submit a support request or technical inquiry to the workshop.</DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleNewInquiry} className="flex min-h-0 flex-1 flex-col">
                        <DialogBody>
                            <div className="space-y-6 px-6 pb-6 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject Header</Label>
                                    <Input 
                                        placeholder="e.g. Inquiry regarding Booking #4521"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="h-12 bg-muted/30 border-none rounded-xl font-bold text-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message Detail</Label>
                                    <Textarea 
                                        placeholder="Provide as much detail as possible for our technical team..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="min-h-[160px] rounded-2xl bg-muted/30 border-none resize-none p-5 text-sm font-medium leading-relaxed"
                                        required
                                    />
                                </div>
                            </div>
                        </DialogBody>

                        <DialogFooter className="p-6 border-t">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !formData.subject || !formData.message}
                                className="w-full h-14 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] text-[11px]"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <><Send className="h-4 w-4 mr-2" /> Dispatch Inquiry</>}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
