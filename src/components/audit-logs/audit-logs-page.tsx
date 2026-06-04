'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { AuditLog } from '@/types/audit-log';
import { StaffMember } from '@/types/staff';
import PageHeader from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Download, ShieldAlert, History, Activity, Database, FileClock, ShieldCheck } from 'lucide-react';
import { AuditLogFilters } from './audit-log-filters';
import { AuditLogTable } from './audit-log-table';
import { useMediaQuery } from '@/hooks/use-media-query';
import { AuditLogCard } from './audit-log-card';
import { AuditLogDetails } from './audit-log-details';
import { subDays, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/shared/loading-state';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

/**
 * @fileOverview Mission-critical system audit management page.
 * Synchronizes with real-time Firestore traces to provide forensic accountability.
 */
export function AuditLogsPage() {
  const router = useRouter();
  const { user: currentUser, role: currentRole, isLoading: authLoading } = useAuth();
  const db = useFirestore();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // 1. Technical Data Streams - Stabilized with useMemoFirebase
  const logsQuery = useMemoFirebase(() => {
      if (!db) return null;
      return query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(500));
  }, [db]);

  const usersQuery = useMemoFirebase(() => {
      if (!db) return null;
      return query(collection(db, 'users'), orderBy('fullName', 'asc'));
  }, [db]);

  const { data: logs, loading: logsLoading } = useCollection<AuditLog>(logsQuery as any);
  const { data: users, loading: usersLoading } = useCollection<StaffMember>(usersQuery as any);

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Authorization Gating
  const isAuthorized = useMemo(() => 
    ['Makros System Owner', 'Workshop Manager', 'Accountant'].includes(currentRole || ''), 
    [currentRole]
  );

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    let filtered = [...logs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((log) => {
        const user = users?.find(u => u.userId === log.userId);
        return (
          (user?.fullName || '').toLowerCase().includes(term) ||
          (log.action || '').toLowerCase().includes(term) ||
          (log.module || '').toLowerCase().includes(term) ||
          (log.recordId || '').toLowerCase().includes(term) ||
          (log.description || '').toLowerCase().includes(term)
        );
      });
    }

    if (moduleFilter !== 'all') {
      filtered = filtered.filter((log) => log.module === moduleFilter);
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => {
        const actionType = getActionType(log.action || '');
        return actionType === actionFilter;
      });
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter((log) => log.userId === userFilter);
    }

    if (dateRange?.from) {
        filtered = filtered.filter((log) => {
            const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt as any);
            if (dateRange.to) {
                return logDate >= startOfDay(dateRange.from!) && logDate <= endOfDay(dateRange.to!);
            }
            return logDate >= startOfDay(dateRange.from!);
        });
    }

    return filtered;
  }, [logs, users, searchTerm, moduleFilter, actionFilter, userFilter, dateRange]);

  // Handle Page Resets on Filter Changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, moduleFilter, actionFilter, userFilter, dateRange]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Forensic Summary Metrics
  const metrics = useMemo(() => {
    if (!logs) return { totalFlux: 0, mutationCount: 0, registryMaturity: 0, securityEvents: 0 };
    
    const mutations = logs.filter(l => ['Create', 'Update', 'Delete'].includes(getActionType(l.action || ''))).length;
    
    const logDates = logs.map(l => l.createdAt?.toDate ? l.createdAt.toDate().getTime() : new Date(l.createdAt as any).getTime()).filter(t => !isNaN(t));
    const sortedDates = [...logDates].sort((a, b) => a - b);
    const maturity = sortedDates.length > 1 ? differenceInDays(new Date(sortedDates[sortedDates.length - 1]), new Date(sortedDates[0])) : 0;

    return {
        totalFlux: logs.length,
        mutationCount: mutations,
        registryMaturity: maturity,
        securityEvents: logs.filter(l => l.action.includes('DELETE') || l.action.includes('DEACTIVATE') || l.action.includes('PURGE')).length
    };
  }, [logs]);

  const handleDateFilter = (filter: string) => {
    const today = new Date();
    switch (filter) {
      case 'today':
        setDateRange({ from: today, to: today });
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setDateRange({ from: yesterday, to: yesterday });
        break;
      case 'last-7-days':
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      default:
        setDateRange(undefined);
        break;
    }
  };

  if (authLoading || logsLoading || usersLoading) return <LoadingState />;

  if (!isAuthorized) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Clearance Restricted</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                    The immutable system log is restricted to administrative personnel.
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
      <PageHeader title="Registry & Trace Audit">
        <div className="flex gap-3">
            <Button variant="outline" className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 rounded-xl bg-background border-border/50">
                <Download className="h-4 w-4 opacity-50" />
                Export Ledger
            </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-gradient-blue border-none text-white overflow-hidden relative shadow-lg shadow-blue-500/20 group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">System Flux</CardTitle>
            <Activity className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:scale-110" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tighter'>{metrics.totalFlux}</p>
            <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Total Certified Events</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Data Integrity</CardTitle>
            <Database className="h-3.5 w-3.5 text-primary opacity-50 group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tighter text-primary'>{metrics.mutationCount}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Mutative Record Shifts</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Security Pulse</CardTitle>
            <ShieldAlert className="h-3.5 w-3.5 text-orange-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tighter text-orange-600'>{metrics.securityEvents}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Decommission Protocols</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Registry Maturity</CardTitle>
            <FileClock className="h-3.5 w-3.5 text-indigo-500 opacity-50 group-hover:text-indigo-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tighter text-indigo-600'>{metrics.registryMaturity}d</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Active History Retention</p>
          </CardContent>
        </Card>
      </div>

      <AuditLogFilters
        onSearch={setSearchTerm}
        onModuleChange={setModuleFilter}
        onActionChange={setActionFilter}
        onDateChange={setDateRange}
        onDateFilter={handleDateFilter}
        moduleFilter={moduleFilter}
        actionFilter={actionFilter}
        dateRange={dateRange}
        userFilter={userFilter}
        onUserChange={setUserFilter}
        users={users?.map(u => ({ userId: u.userId, fullName: u.fullName })) || []}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <History className="h-3.5 w-3.5" /> Certified System Log
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground/60">{filteredLogs.length} Trace Records Found</span>
        </div>

        {isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paginatedLogs.map((log) => {
                const id = (log as any).id || log.logId;
                return (
                  <div key={id} onClick={() => setSelectedLog(log)} className="cursor-pointer">
                      <AuditLogCard log={{...log, user: users?.find(u => u.userId === log.userId)}} />
                  </div>
                )
            })}
            </div>
        ) : (
            <AuditLogTable logs={paginatedLogs} onViewDetails={setSelectedLog} users={users || []} />
        )}

        <DataTablePagination 
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />

        {filteredLogs.length === 0 && (
            <div className="py-32 text-center border-2 border-dashed rounded-[3rem] opacity-30 flex flex-col items-center justify-center space-y-4">
                <ShieldCheck className="h-12 w-12" />
                <p className="text-sm font-medium italic">No trace records matching current criteria.</p>
            </div>
        )}
      </div>

      <AuditLogDetails 
        log={selectedLog} 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        user={users?.find(u => u.userId === selectedLog?.userId)}
      />
    </div>
  );
}

function getActionType(action: string) {
  const act = action.toUpperCase();
  if (act.includes("CREATE") || act.includes("REGISTER") || act.includes("ADD") || act.includes("ENROLL") || act.includes("SCHEDULE")) return "Create";
  if (act.includes("UPDATE") || act.includes("ASSIGN") || act.includes("SYNC") || act.includes("EDIT") || act.includes("RECALIBRATE")) return "Update";
  if (act.includes("DELETE") || act.includes("DEACTIVATE") || act.includes("PURGE") || act.includes("REMOVE")) return "Delete";
  return "System";
}
