
'use client';

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { CommunicationLog, CommunicationChannel, CommunicationPriority } from '@/types/notification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
    RefreshCcw, 
    Search, 
    Filter, 
    Activity, 
    Plus, 
    ShieldAlert, 
    List, 
    LayoutGrid, 
    MessageSquare, 
    History, 
    ShieldCheck, 
    Tag,
    AlertTriangle,
    ArrowRightLeft,
    Inbox
} from 'lucide-react';
import { NotificationList } from '@/components/notifications/notification-list';
import { NotificationCard } from '@/components/notifications/notification-card';
import { NotificationPreviewDialog } from '@/components/notifications/notification-preview-dialog';
import { NewNotificationDialog } from '@/components/notifications/new-notification-dialog';
import { LoadingState } from '@/components/shared/loading-state';
import PageHeader from '@/components/layout/page-header';
import { useAuth } from '@/contexts/auth-context';
import { useMediaQuery } from '@/hooks/use-media-query';

const CHANNELS: CommunicationChannel[] = ["In-App", "Phone Call", "SMS", "WhatsApp", "Email", "Walk-In", "Internal Note"];
const PRIORITIES: CommunicationPriority[] = ["Low", "Normal", "High", "Urgent"];

export default function NotificationsPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const db = useFirestore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isAuthorized = useMemo(() => {
    if (!currentUser) return false;
    return ['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Accountant', 'Mechanic', 'Inventory Officer'].includes(currentUser.role);
  }, [currentUser]);

  const logsQuery = useMemoFirebase(() => {
    if (!isAuthorized || !db) return null;
    return query(collection(db, 'communicationLogs'), orderBy('createdAt', 'desc'));
  }, [db, isAuthorized]);

  const { data: logs, loading: collectionLoading } = useCollection<CommunicationLog>(logsQuery as any);

  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<CommunicationLog | null>(null);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(isMobile ? 'grid' : 'list');

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log) => {
      const matchesSearch = log.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.logId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.fromName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChannel = channelFilter === 'all' || log.channel === channelFilter;
      const matchesPriority = priorityFilter === 'all' || log.priority === priorityFilter;
      return matchesSearch && matchesChannel && matchesPriority;
    });
  }, [logs, searchTerm, channelFilter, priorityFilter]);

  const stats = useMemo(() => {
    if (!logs) return { total: 0, urgent: 0, internal: 0, outgoing: 0 };
    const total = logs.length;
    const urgent = logs.filter(l => l.priority === 'Urgent' && l.status !== 'Closed').length;
    const internal = logs.filter(l => l.direction === 'Internal').length;
    const outgoing = logs.filter(l => l.direction === 'Outgoing').length;
    
    return { total, urgent, internal, outgoing };
  }, [logs]);

  if (authLoading || (isAuthorized && collectionLoading)) return <LoadingState />;

  if (!isAuthorized) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Clearance Restricted</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                    Traceable conversation logs are limited to authorized workshop personnel.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <PageHeader title="Communications Log">
        <div className="flex items-center gap-3">
            <div className="hidden sm:flex bg-muted/50 p-1 rounded-xl border border-border/50">
                <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setViewMode('list')}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setViewMode('grid')}
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
            </div>
            <Button onClick={() => setIsNewDialogOpen(true)} className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-xl shadow-primary/20">
                <Plus className="h-4 w-4" /> Log Interaction
            </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-gradient-blue border-none text-white overflow-hidden relative shadow-lg shadow-blue-500/20 group rounded-[2rem]">
          <CardHeader className="pb-2 p-8">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Total Traces</CardTitle>
            <History className="h-4 w-4 opacity-50 transition-transform group-hover:scale-110" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className='text-4xl font-black tracking-tight'>{stats.total}</p>
            <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Interaction Registry</p>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm rounded-[2rem]">
          <CardHeader className="pb-2 p-8">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Critical Action</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 opacity-50" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className='text-4xl font-black tracking-tight text-red-600'>{stats.urgent}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Urgent Response Required</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm rounded-[2rem]">
          <CardHeader className="pb-2 p-8">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Internal Sync</CardTitle>
            <ShieldCheck className="h-4 w-4 text-indigo-500 opacity-50" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className='text-4xl font-black tracking-tight text-indigo-600'>{stats.internal}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Personnel Technical Notes</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm rounded-[2rem]">
          <CardHeader className="pb-2 p-8">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Client Outreach</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-green-500 opacity-50" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className='text-4xl font-black tracking-tight text-green-600'>{stats.outgoing}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Dispatched Communications</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-3xl">
        <div className="relative flex-grow w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
                placeholder="Search logs by subject, personnel, or Record ID..."
                className="pl-11 bg-background h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm border-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 flex-1 md:flex-none">
                <Tag className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                    <SelectTrigger className="bg-background h-12 rounded-2xl shadow-sm min-w-[160px] border-none font-bold uppercase text-[10px] tracking-widest">
                        <SelectValue placeholder="All Protocols" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="all" className="text-[10px] font-bold uppercase">Any Protocol</SelectItem>
                        {CHANNELS.map(c => <SelectItem key={c} value={c} className="text-[10px] font-bold uppercase">{c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2 flex-1 md:flex-none">
                <AlertTriangle className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="bg-background h-12 rounded-2xl shadow-sm min-w-[150px] border-none font-bold uppercase text-[10px] tracking-widest">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="all" className="text-[10px] font-bold uppercase">All Priorities</SelectItem>
                        {PRIORITIES.map(p => <SelectItem key={p} value={p} className="text-[10px] font-bold uppercase">{p}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                <Activity className="h-3.5 w-3.5" /> Technical Trace Ledger
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground/60 whitespace-nowrap">{filteredLogs.length} Forensic Records Found</span>
        </div>

        {viewMode === 'list' ? (
            <NotificationList 
                notifications={filteredLogs} 
                onPreview={setSelectedLog}
            />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLogs.map((log) => (
                    <NotificationCard 
                        key={log.logId}
                        notification={log}
                        onPreview={setSelectedLog}
                    />
                ))}
            </div>
        )}

        {filteredLogs.length === 0 && (
            <div className="py-32 text-center border-2 border-dashed rounded-[3rem] opacity-30 bg-muted/5 flex flex-col items-center">
                <Inbox className="h-12 w-12 mb-4" />
                <p className="text-sm font-medium italic">No interaction traces matching your current query.</p>
            </div>
        )}
      </div>

      <NotificationPreviewDialog 
        note={selectedLog} 
        isOpen={!!selectedLog} 
        onOpenChange={(open) => !open && setSelectedLog(null)} 
      />

      <NewNotificationDialog 
        isOpen={isNewDialogOpen} 
        onOpenChange={setIsNewDialogOpen} 
      />
    </div>
  );
}
