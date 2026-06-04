'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Query } from 'firebase/firestore';
import { StaffMember, UserRole } from '@/types/staff';
import { JobCard } from '@/types/job-card';
import { StaffTable } from '@/components/staff/staff-table';
import { AddStaffModal } from '@/components/staff/add-staff-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { RoleSwitcher } from '@/components/staff/role-switcher';
import PageHeader from '@/components/layout/page-header';
import { Users, Zap, Wrench, Clock, Search, Filter, Activity, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/loading-state';
import { enrollStaff, updateStaffRecord, activateStaff, deactivateStaff } from '@/services/users-service';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

const ROLES: UserRole[] = [
  "Makros System Owner",
  "Workshop Manager",
  "Receptionist",
  "Mechanic",
  "Inventory Officer",
  "Accountant",
];

export default function StaffPage() {
  const router = useRouter();
  const { user: currentUser, role: currentRole, isLoading: authLoading } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  // 1. Live Data Streams (Memoized)
  const usersQuery = useMemoFirebase(() => query(collection(db, 'users'), orderBy('fullName', 'asc')) as Query<StaffMember>, [db]);
  const jobsQuery = useMemoFirebase(() => query(collection(db, 'jobCards')) as Query<JobCard>, [db]);

  const { data: users, loading: usersLoading } = useCollection<StaffMember>(usersQuery);
  const { data: jobCards, loading: jobsLoading } = useCollection<JobCard>(jobsQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive' | 'All'>('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Authorization check
  const canManageRegistry = useMemo(() => 
    !!currentRole && ['Makros System Owner', 'Workshop Manager'].includes(currentRole), 
    [currentRole]
  );

  const canViewAllStaff = useMemo(() => 
    !!currentRole && ['Makros System Owner', 'Workshop Manager', 'Accountant', 'Receptionist'].includes(currentRole),
    [currentRole]
  );

  // 2. Workforce Intelligence Join
  const staffWithWorkload = useMemo(() => {
    if (!users) return [];
    return users.map((s) => {
      if (s.role === 'Mechanic') {
        const activeJobs = (jobCards || []).filter(j => j.assignedMechanicId === s.userId && ['In Progress', 'Diagnosing', 'Waiting for Parts'].includes(j.status)).length;
        const completedJobs = (jobCards || []).filter(j => j.assignedMechanicId === s.userId && j.status === 'Completed').length;
        return { ...s, assignedJobs: activeJobs, completedJobs, currentWorkload: activeJobs };
      }
      return { ...s, assignedJobs: 0, completedJobs: 0, currentWorkload: 0 };
    });
  }, [users, jobCards]);

  const mechanics = useMemo(() => staffWithWorkload.filter(s => s.role === 'Mechanic'), [staffWithWorkload]);

  const filteredStaff = useMemo(() => {
    return staffWithWorkload
      .filter((s) => {
          // Mechanics can only see themselves and other mechanics for coordination
          if (currentRole === 'Mechanic') return s.userId === currentUser?.userId || s.role === 'Mechanic';
          return true;
      })
      .filter((s) => {
        if (roleFilter === 'All') return true;
        return s.role === roleFilter;
      })
      .filter((s) => {
        if (statusFilter === 'All') return true;
        return s.status === statusFilter;
      })
      .filter((s) =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [staffWithWorkload, currentRole, currentUser, roleFilter, statusFilter, searchTerm]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStaff.slice(startIndex, startIndex + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  // 3. Operational Actions
  const onAddStaff = useCallback(async (newStaff: Partial<StaffMember>) => {
    if (!currentUser) return;

    try {
      await enrollStaff(newStaff, currentUser.userId);
    } catch (error) {
      console.error("Staff enrollment error details:", error);
      throw error; // Let modal handle specific error messaging
    }
  }, [currentUser]);

  const onEditStaff = useCallback((staffId: string, updatedStaff: Partial<StaffMember>) => {
    if (!currentUser) return;
    updateStaffRecord(staffId, updatedStaff, currentUser.userId);
    toast({ title: "Record Synchronized", description: "Technical parameters updated." });
  }, [currentUser, toast]);

  if (authLoading || usersLoading || jobsLoading) return <LoadingState />;

  if (!canViewAllStaff && currentRole !== 'Mechanic') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Access Restricted</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                    Personnel registry access is limited to authorized workshop staff.
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
      {canManageRegistry && <RoleSwitcher />}
      
      <PageHeader title="Human Capital & Staff">
        {canManageRegistry && (
            <AddStaffModal onAdd={onAddStaff} />
        )}
      </PageHeader>

      {canViewAllStaff && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-gradient-blue border-none text-white overflow-hidden relative shadow-lg shadow-blue-500/20 group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Force Strength</CardTitle>
              <Users className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-black tracking-tight'>{users?.length || 0}</p>
              <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Registered Personnel</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Technical Units</CardTitle>
              <Wrench className="h-3.5 w-3.5 text-primary opacity-50" />
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-black tracking-tight text-foreground'>{mechanics.length}</p>
              <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Qualified Technicians</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Availability</CardTitle>
              <Zap className="h-3.5 w-3.5 text-green-500 opacity-50" />
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-black tracking-tight text-green-600'>{mechanics.filter(m => (m.assignedJobs || 0) < 2 && m.status === 'Active').length}</p>
              <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Low Workload Ready</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Throughput</CardTitle>
              <Activity className="h-3.5 w-3.5 text-indigo-500 opacity-50" />
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-black tracking-tight text-indigo-600'>{mechanics.reduce((sum, m) => sum + (m.completedJobs || 0), 0)}</p>
              <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Lifetime Work cycles</p>
            </CardContent>
          </Card>
        </div>
      )}

      {canViewAllStaff && (
        <div className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-2xl">
          <div className="relative flex-grow w-full lg:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search personnel by name, UID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select onValueChange={(value) => setRoleFilter(value as UserRole | 'All')} defaultValue="All">
                <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[160px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Designations</SelectItem>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select onValueChange={(value) => setStatusFilter(value as 'Active' | 'Inactive' | 'All')} defaultValue="All">
              <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active Duty</SelectItem>
                <SelectItem value="Inactive">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" /> Personnel Registry
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground/60">{filteredStaff.length} Records found</span>
        </div>
        <StaffTable 
            staff={paginatedStaff} 
            onEdit={onEditStaff} 
            onDeactivate={(id) => currentUser && deactivateStaff(id, currentUser.userId)} 
            onActivate={(id) => currentUser && activateStaff(id, currentUser.userId)} 
        />
        <DataTablePagination 
            totalItems={filteredStaff.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}
