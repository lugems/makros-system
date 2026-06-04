'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { CommunicationLog, CommunicationModule } from '@/types/communication';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    History, 
    Activity, 
    Plus, 
    ShieldCheck, 
    MessageSquare, 
    AlertTriangle,
    ArrowRightLeft,
    Inbox,
    List,
    LayoutGrid,
    Lock,
    ShieldAlert,
    Smartphone,
    UserCheck,
    Search,
    Tag,
    Clock
} from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import { useAuth } from '@/contexts/auth-context';
import { useMediaQuery } from '@/hooks/use-media-query';
import { LoadingState } from '@/components/shared/loading-state';
import { useToast } from '@/hooks/use-toast';
import { subDays, isSameDay, isWithinInterval, startOfMonth } from 'date-fns';

import { CommunicationsTable } from '@/components/communications/communications-table';
import { CommunicationCard } from '@/components/communications/communication-card';
import { CommunicationFilters } from '@/components/communications/communication-filters';
import { CommunicationForm } from '@/components/communications/communication-form';
import { CommunicationDetails } from '@/components/communications/communication-details';
import { createCommunicationLog, updateCommunicationLog } from '@/services/communications-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

/**
 * @fileOverview Forensic Communications Registry & Search Terminal.
 * Implements high-fidelity deep search and granular multi-dimensional filtering.
 */
export default function CommunicationsPage() {
  const { user: currentUser, role: currentRole, isLoading: authLoading } = useAuth();
  const db = useFirestore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();

  const isStaff = useMemo(() => {
    return ['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Accountant', 'Mechanic', 'Inventory Officer'].includes(currentRole || '');
  }, [currentRole]);

  // Real-time Technical Streams (Stabilized)
  const logsQuery = useMemoFirebase(() => {
    if (!isStaff || !db) return null;
    return query(collection(db, 'communicationLogs'), orderBy('createdAt', 'desc'));
  }, [db, isStaff]);

  const custQuery = useMemoFirebase(() => query(collection(db, 'customers')), [db]);
  const vehQuery = useMemoFirebase(() => query(collection(db, 'vehicles')), [db]);

  const { data: logs, loading: collectionLoading } = useCollection<CommunicationLog>(logsQuery as any);
  const { data: customers } = useCollection<Customer>(custQuery as any);
  const { data: vehicles } = useCollection<Vehicle>(vehQuery as any);

  // State Management for Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateInterval, setDateInterval] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(isMobile ? 'grid' : 'list');
  const [selectedLog, setSelectedLog] = useState<CommunicationLog | null>(null);
  const [editingLog, setEditingLog] = useState<CommunicationLog | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FORENSIC SEARCH & FILTER ENGINE
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    return logs.filter((log) => {
      // 1. Context Resolution for Deep Search
      const customer = customers?.find(c => c.customerId === log.customerId);
      const vehicle = vehicles?.find(v => v.vehicleId === log.vehicleId);
      
      const searchableStr = [
          log.subject,
          log.message,
          log.logId,
          log.fromName,
          log.toName,
          log.fromRole,
          log.toRole,
          log.channel,
          log.status,
          log.priority,
          log.jobCardId,
          log.invoiceId,
          log.bookingId,
          customer?.fullName,
          vehicle?.numberPlate
      ].join(' ').toLowerCase();

      const matchesSearch = !searchTerm || searchableStr.includes(searchTerm.toLowerCase());
      
      // 2. Categorical Logic
      const matchesChannel = channelFilter === 'all' || log.channel === channelFilter;
      const matchesPriority = priorityFilter === 'all' || log.priority === priorityFilter;
      const matchesDirection = directionFilter === 'all' || log.direction === directionFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      const matchesRole = roleFilter === 'all' || log.fromRole === roleFilter || log.toRole === roleFilter;

      // 3. Temporal Interval Logic
      let matchesDate = true;
      if (dateInterval !== 'all') {
          const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
          const today = new Date();
          
          if (dateInterval === 'today') {
              matchesDate = isSameDay(logDate, today);
          } else if (dateInterval === 'yesterday') {
              matchesDate = isSameDay(logDate, subDays(today, 1));
          } else if (dateInterval === 'last7') {
              matchesDate = isWithinInterval(logDate, { start: subDays(today, 7), end: today });
          } else if (dateInterval === 'last30') {
              matchesDate = isWithinInterval(logDate, { start: subDays(today, 30), end: today });
          } else if (dateInterval === 'thisMonth') {
              matchesDate = isWithinInterval(logDate, { start: startOfMonth(today), end: today });
          }
      }

      // 4. RBAC Visibility Logic (Staff vs Specific Modules)
      let hasRoleAccess = false;
      if (['Makros System Owner', 'Workshop Manager', 'Receptionist'].includes(currentRole || '')) {
          hasRoleAccess = true;
      } else {
          if (currentRole === 'Mechanic' && log.module === 'Job Card') hasRoleAccess = true;
          if (currentRole === 'Accountant' && log.module === 'Invoicing') hasRoleAccess = true;
          if (currentRole === 'Inventory Officer' && log.module === 'Inventory') hasRoleAccess = true;
      }
      
      return matchesSearch && matchesChannel && matchesPriority && matchesDirection && matchesStatus && matchesRole && matchesDate && hasRoleAccess;
    });
  }, [logs, customers, vehicles, searchTerm, channelFilter, priorityFilter, directionFilter, statusFilter, roleFilter, dateInterval, currentRole]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, channelFilter, priorityFilter, directionFilter, statusFilter, roleFilter, dateInterval]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Operational Pulse Matrix
  const stats = useMemo(() => {
    if (!logs) return { total: 0, open: 0, pending: 0, resolved: 0, urgent: 0, customer: 0, internal: 0, followUpToday: 0 };
    const todayStr = new Date().toISOString().split('T')[0];
    
    return {
      total: filteredLogs.length,
      open: filteredLogs.filter(l => l.status === 'Open').length,
      pending: filteredLogs.filter(l => l.status === 'Pending Response').length,
      resolved: filteredLogs.filter(l => l.status === 'Resolved').length,
      urgent: filteredLogs.filter(l => l.priority === 'Urgent' && l.status !== 'Closed').length,
      customer: filteredLogs.filter(l => l.direction !== 'Internal').length,
      internal: filteredLogs.filter(l => l.direction === 'Internal').length,
      followUpToday: filteredLogs.filter(l => l.requiresFollowUp && l.followUpDate === todayStr && l.status !== 'Closed').length,
    };
  }, [filteredLogs]);

  const handleFormSubmit = async (data: any) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      if (editingLog) {
          await updateCommunicationLog(editingLog.logId, data, currentUser.userId);
          toast({ title: "Trace Updated", description: "Forensic record synchronized." });
      } else {
          await createCommunicationLog(data, currentUser.userId);
          toast({ title: "Interaction Registered", description: "Trace record committed to registry." });
      }
      setIsFormOpen(false);
      setEditingLog(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Operation Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (isStaff && collectionLoading)) return <LoadingState />;

  if (!isStaff) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500 text-center">
            <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Clearance Restricted</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                    The workshop interaction ledger is restricted to authorized personnel. 
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <PageHeader title="Interaction Command">
        <div className="flex items-center gap-3">
            <div className="hidden sm:flex bg-muted/50 p-1 rounded-xl border border-border/50">
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-xl shadow-primary/20">
                <Plus className="h-4 w-4" /> Log Interaction
            </Button>
        </div>
      </PageHeader>

      {/* Analytical Pulse Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { label: 'Registry Load', val: stats.total, icon: History, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Active Open', val: stats.open, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Pending Resp.', val: stats.pending, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/5' },
          { label: 'Resolved', val: stats.resolved, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/5' },
          { label: 'Urgent Matter', val: stats.urgent, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-600/5' },
          { label: 'Outreach', val: stats.customer, icon: Smartphone, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Internal Notes', val: stats.internal, icon: Lock, color: 'text-slate-600', bg: 'bg-slate-600/5' },
          { label: 'Target: Today', val: stats.followUpToday, icon: UserCheck, color: 'text-orange-600', bg: 'bg-orange-600/5' },
        ].map(stat => (
            <Card key={stat.label} className="bg-card border-border/50 rounded-2xl overflow-hidden group">
                <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-1", stat.bg, stat.color)}>
                        <stat.icon className="h-4 w-4" />
                    </div>
                    <p className="text-xl font-black tabular-nums leading-none">{stat.val}</p>
                    <p className="text-[7px] font-black uppercase text-muted-foreground tracking-widest leading-tight">{stat.label}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <CommunicationFilters 
        onSearch={setSearchTerm}
        onChannelChange={setChannelFilter}
        onPriorityChange={setPriorityFilter}
        onDirectionChange={setDirectionFilter}
        onStatusChange={setStatusFilter}
        onRoleChange={setRoleFilter}
        onDateIntervalChange={setDateInterval}
        channel={channelFilter}
        priority={priorityFilter}
        direction={directionFilter}
        status={statusFilter}
        role={roleFilter}
        dateInterval={dateInterval}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" /> Interaction Trace Ledger
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground/60">{filteredLogs.length} Records Found</span>
        </div>

        {viewMode === 'list' ? (
          <CommunicationsTable logs={paginatedLogs} onPreview={setSelectedLog} onEdit={(log) => { setEditingLog(log); setIsFormOpen(true); }} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedLogs.map(log => (
              <CommunicationCard key={log.logId} log={log} onPreview={setSelectedLog} onEdit={(log) => { setEditingLog(log); setIsFormOpen(true); }} />
            ))}
          </div>
        )}

        <DataTablePagination 
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />

        {filteredLogs.length === 0 && (
          <div className="py-32 text-center border-2 border-dashed rounded-[3rem] opacity-30 bg-muted/5 flex flex-col items-center">
            <Inbox className="h-12 w-12 mb-4" />
            <p className="text-sm font-medium italic text-muted-foreground">No interaction traces matching your current query parameters.</p>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={(o) => { setIsFormOpen(o); if(!o) setEditingLog(null); }}>
        <DialogContent className="sm:max-w-[640px] p-0 border-border/50 overflow-hidden rounded-3xl">
          <DialogHeader className="p-8 border-b bg-muted/30">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                {editingLog ? 'Synchronize Interaction' : 'Register Interaction'}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Log a forensic interaction in the workshop master registry.</DialogDescription>
          </DialogHeader>
          <CommunicationForm 
            onSubmit={handleFormSubmit} 
            isSubmitting={isSubmitting} 
            initialData={editingLog} 
          />
        </DialogContent>
      </Dialog>

      <CommunicationDetails 
        log={selectedLog} 
        isOpen={!!selectedLog} 
        onOpenChange={(open) => !open && setSelectedLog(null)} 
      />
    </div>
  );
}
