'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMediaQuery } from '@/hooks/use-media-query';
import { JobCard, JobCardStatus } from '@/types/job-card';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { StaffMember } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Plus, 
    ClipboardList, 
    Wrench, 
    Search, 
    Filter, 
    Activity, 
    Clock, 
    Package, 
    AlertCircle, 
    LayoutGrid, 
    List,
    ShieldCheck,
    ShieldAlert,
    Sparkles,
    UserCheck
} from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import { JobCardsTable } from '@/components/job-cards/job-cards-table';
import { JobCardCard } from '@/components/job-cards/job-card-card';
import { LoadingState } from '@/components/shared/loading-state';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateJobCard, deleteJobCard } from '@/services/job-cards-service';
import { useToast } from '@/hooks/use-toast';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

const TECHNICIAN_ROLES = [
  "Senior Mechanic / Lead Mechanic",
  "Mechanic",
  "Diagnostic Technician",
  "Auto-Wiring Technician",
  "Welding Lead Technician",
  "Welding Technician",
  "Auto Body / Panel Beater",
  "Painter",
  "Tyre & Wheel Technician",
  "Car Wash / Detailing Technician",
];

/**
 * @fileOverview Technical Operation Command Center.
 * Stabilized with useMemoFirebase to manage real-time dossier joins without render loops.
 * Synchronized with the expanded 16-role personnel matrix.
 */
export default function JobCardsPage() {
  const { user: currentUser, role: currentRole, isLoading: authLoading } = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Rule Check: Staff can read (security rules handle customer filter, but we gate the page)
  const isStaff = ['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Mechanic', 'Senior Mechanic / Lead Mechanic', 'Inventory Officer', 'Accountant', 'Quality Control Officer'].includes(currentRole || '');

  // Real-time Operational Traces (Stabilized Queries)
  const jobsQuery = useMemoFirebase(() => {
    if (!isStaff || !db) return null;
    return query(collection(db, 'jobCards'), orderBy('createdAt', 'desc'));
  }, [db, isStaff]);

  const custQuery = useMemoFirebase(() => {
    if (!isStaff || !db) return null;
    return query(collection(db, 'customers'));
  }, [db, isStaff]);

  const vehQuery = useMemoFirebase(() => {
    if (!isStaff || !db) return null;
    return query(collection(db, 'vehicles'));
  }, [db, isStaff]);

  const userQuery = useMemoFirebase(() => {
    if (!isStaff || !db) return null;
    return query(collection(db, 'users'));
  }, [db, isStaff]);

  const { data: jobCards, loading: jobLoading } = useCollection<JobCard>(jobsQuery as any);
  const { data: customers } = useCollection<Customer>(custQuery as any);
  const { data: vehicles } = useCollection<Vehicle>(vehQuery as any);
  const { data: users } = useCollection<StaffMember>(userQuery as any);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [mechanicFilter, setMechanicFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(isMobile ? 'grid' : 'table');
  
  const [editingJob, setEditingJob] = useState<JobCard | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobCard | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Authority Logic
  const isOwner = currentRole === 'Makros System Owner';
  const isManager = currentRole === 'Workshop Manager';
  const isReceptionist = currentRole === 'Receptionist';
  const isSeniorMechanic = currentRole === 'Senior Mechanic / Lead Mechanic';
  
  // Senior Mechanics are granted initialization authority for delegation
  const canCreateDelete = isOwner || isManager || isReceptionist || isSeniorMechanic;

  const isLoading = jobLoading || authLoading;

  // Operational Stats
  const stats = useMemo(() => {
    if (!jobCards) return { active: 0, diagnosing: 0, waitingParts: 0, readyForInvoicing: 0, totalWIPValue: 0 };
    const active = jobCards.filter(jc => !(['Completed', 'Cancelled', 'Delivered', 'Paid', 'Invoiced'] as string[]).includes(jc.status as string)).length;
    const diagnosing = jobCards.filter(jc => jc.status === JobCardStatus.Diagnosing).length;
    const waitingParts = jobCards.filter(jc => jc.status === JobCardStatus.WaitingForParts).length;
    const readyForInvoicing = jobCards.filter(jc => ([JobCardStatus.Completed, JobCardStatus.QualityCheck] as string[]).includes(jc.status as string)).length;
    const totalWIPValue = jobCards
        .filter(jc => !(['Cancelled', 'Delivered', 'Paid'] as string[]).includes(jc.status as string))
        .reduce((acc, jc: any) => acc + (jc.jobTotal || 0), 0);

    return { active, diagnosing, waitingParts, readyForInvoicing, totalWIPValue };
  }, [jobCards]);

  const filteredJobCards = useMemo(() => {
    if (!jobCards) return [];
    return jobCards.filter(jc => {
      const customer = customers?.find(c => c.customerId === jc.customerId);
      const vehicle = vehicles?.find(v => v.vehicleId === jc.vehicleId);
      const matchesSearch = 
        jc.jobCardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle?.numberPlate || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || jc.status === statusFilter;
      const matchesMechanic = mechanicFilter === 'All' || jc.assignedMechanicId === mechanicFilter;

      return matchesSearch && matchesStatus && matchesMechanic;
    });
  }, [jobCards, searchTerm, statusFilter, mechanicFilter, customers, vehicles]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, mechanicFilter]);

  const paginatedJobCards = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredJobCards.slice(startIndex, startIndex + pageSize);
  }, [filteredJobCards, currentPage, pageSize]);

  const handleUpdateJob = (data: Partial<JobCard>) => {
    if (editingJob && currentUser) {
        updateJobCard(editingJob.jobCardId, data, currentUser.userId);
        setEditingJob(null);
        toast({ title: "Operation Synchronized", description: "Record updated." });
    }
  };

  const handleDeleteJob = () => {
    if (jobToDelete && currentUser) {
        deleteJobCard(jobToDelete.jobCardId, currentUser.userId);
        setJobToDelete(null);
        toast({ title: "Operation Purged", description: "Record removed from registry." });
    }
  };

  // Expanded technician list for assignment filtering
  const technicians = useMemo(() => users?.filter(u => TECHNICIAN_ROLES.includes(u.role)) || [], [users]);

  if (isLoading) return <LoadingState />;

  if (!isStaff) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Access Restricted</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                    Workshop operations registry is restricted to authorized personnel. Clients must use the Service Portal.
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
      <PageHeader title="Workshop Operations">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-muted/50 p-1 rounded-xl border border-border/50">
            <Button 
                variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => setViewMode('table')}
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
          {canCreateDelete && (
              <Button onClick={() => router.push('/job-cards/new')} className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" /> Initialize Intake
              </Button>
          )}
        </div>
      </PageHeader>

      {/* Summary Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active Bay Load</CardTitle>
            <Activity className="h-3.5 w-3.5 text-primary opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight text-primary'>{stats.active}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Current jobs in bay</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Diagnostics</CardTitle>
            <Clock className="h-3.5 w-3.5 text-amber-500 opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight text-amber-600'>{stats.diagnosing}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Awaiting analysis</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Supply Chain</CardTitle>
            <Package className="h-3.5 w-3.5 text-indigo-500 opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight text-indigo-600'>{stats.waitingParts}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Waiting for parts</p>
          </CardContent>
        </Card>

        <Card className="dashboard-gradient-blue border-none text-white overflow-hidden group shadow-lg shadow-blue-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Workflow Value</CardTitle>
            <Sparkles className="h-3.5 w-3.5 opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight'>
                <CurrencyFormat value={stats.totalWIPValue} />
            </p>
            <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Projected Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Operations Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by Job ID, plate, or client..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm" 
          />
        </div>
        <div className='flex flex-wrap items-center gap-3 w-full lg:w-auto'>
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Workflow States</SelectItem>
                {Object.values(JobCardStatus).map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <UserCheck className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={mechanicFilter} onValueChange={setMechanicFilter}>
                <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[200px]">
                <SelectValue placeholder="Lead Technician" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Technical Personnel</SelectItem>
                    {technicians.map(m => (
                        <SelectItem key={m.userId} value={m.userId} className="font-bold text-xs uppercase">
                            {m.fullName} ({m.role.split(' ')[0]})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Operations View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" /> Operations Registry
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground/60">{filteredJobCards.length} Trace Records Found</span>
        </div>

        {viewMode === 'table' && !isMobile ? (
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                <JobCardsTable 
                  jobCards={paginatedJobCards} 
                  canManage={canCreateDelete}
                  onDelete={setJobToDelete}
                />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedJobCards.map(job => (
                    <JobCardCard key={job.jobCardId} job={job} />
                ))}
            </div>
        )}

        <DataTablePagination 
            totalItems={filteredJobCards.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />

        {filteredJobCards.length === 0 && (
            <div className="py-32 text-center border-2 border-dashed rounded-[2.5rem] opacity-30 bg-muted/5">
                <ClipboardList className="h-12 w-12 mx-auto mb-4" />
                <p className="text-sm font-medium italic">No operational traces matching your query.</p>
            </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!jobToDelete} onOpenChange={(o) => !o && setJobToDelete(null)}>
          <AlertDialogContent className="rounded-3xl border-border/50">
              <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Purge Operational Record?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                      You are about to permanently decommission Job Card <span className="font-bold text-foreground">#{jobToDelete?.jobCardId.toUpperCase().slice(-8)}</span>. This operation is forensic-grade and irreversible.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteJob} className="rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest text-[10px] h-11 border-none text-white">Confirm Purge</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}