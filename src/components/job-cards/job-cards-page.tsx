'use client';

import React, { useState, useMemo } from 'react';
import useMakrosStore from '@/store/makros-store';
import { useMediaQuery } from '@/hooks/use-media-query';
import { JobCard, JobCardStatus } from '@/types/job-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
    History,
    Edit,
    Trash2,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import { NewJobCardDialog } from '@/components/job-cards/new-job-card-dialog';
import { JobCardsTable } from '@/components/job-cards/job-cards-table';
import { JobCardCard } from '@/components/job-cards/job-card-card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function JobCardsPage() {
  const { jobCards, customers, vehicles, users, updateJobCard, deleteJobCard } = useMakrosStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [mechanicFilter, setMechanicFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(isMobile ? 'grid' : 'table');
  
  const [editingJob, setEditingJob] = useState<JobCard | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobCard | null>(null);

  // Operational Stats
  const stats = useMemo(() => {
    const active = jobCards.filter(jc => !['Completed', 'Cancelled', 'Delivered', 'Paid'].includes(jc.status)).length;
    const diagnosing = jobCards.filter(jc => jc.status === 'Diagnosing').length;
    const waitingParts = jobCards.filter(jc => jc.status === 'Waiting for Parts').length;
    const readyForInvoicing = jobCards.filter(jc => ['Completed', 'Quality Check'].includes(jc.status)).length;

    return { active, diagnosing, waitingParts, readyForInvoicing };
  }, [jobCards]);

  const filteredJobCards = useMemo(() => {
    return jobCards.filter(jc => {
      const customer = customers.find(c => c.customerId === jc.customerId);
      const vehicle = vehicles.find(v => v.vehicleId === jc.vehicleId);
      const matchesSearch = 
        jc.jobCardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle?.numberPlate.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || jc.status === statusFilter;
      const matchesMechanic = mechanicFilter === 'All' || jc.assignedMechanicId === mechanicFilter;

      return matchesSearch && matchesStatus && matchesMechanic;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [jobCards, searchTerm, statusFilter, mechanicFilter, customers, vehicles]);

  const activeMechanics = users.filter(u => u.role === 'Mechanic');

  const handleUpdateJob = (data: Partial<JobCard>) => {
      if (editingJob) {
          updateJobCard({ ...editingJob, ...data });
          setEditingJob(null);
          toast({ title: "Operation Synchronized", description: `Job record updated successfully.` });
      }
  };

  const handleDeleteJob = () => {
      if (jobToDelete) {
          deleteJobCard(jobToDelete.jobCardId);
          setJobToDelete(null);
          toast({ title: "Operation Purged", description: "The job card has been removed from the workshop Os." });
      }
  };

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
          <NewJobCardDialog />
        </div>
      </PageHeader>

      {/* Summary Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active Bay Load</CardTitle>
            <Activity className="h-3.5 w-3.5 text-primary opacity-50 transition-transform group-hover:scale-110" />
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

        <Card className="dashboard-gradient-green border-none text-white overflow-hidden group shadow-lg shadow-green-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Ready to Close</CardTitle>
            <ShieldCheck className="h-3.5 w-3.5 opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight'>{stats.readyForInvoicing}</p>
            <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Completed / Testing</p>
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
          <Select value={mechanicFilter} onValueChange={setMechanicFilter}>
            <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[180px]">
              <SelectValue placeholder="Mechanic" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="All">All Technicians</SelectItem>
                {activeMechanics.map(m => (
                    <SelectItem key={m.userId} value={m.userId}>{m.fullName}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Operations View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" /> Operations Registry
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground/60">{filteredJobCards.length} Trace Records</span>
        </div>

        {viewMode === 'table' && !isMobile ? (
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                <JobCardsTable 
                    jobCards={filteredJobCards} 
                    onDelete={setJobToDelete}
                />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobCards.map(job => (
                    <JobCardCard 
                        key={job.jobCardId} 
                        job={job} 
                    />
                ))}
            </div>
        )}

        {filteredJobCards.length === 0 && (
            <div className="py-32 text-center border-2 border-dashed rounded-[2.5rem] opacity-30 bg-muted/5">
                <ClipboardList className="h-12 w-12 mx-auto mb-4" />
                <p className="text-sm font-medium italic">No operational traces matching your query.</p>
            </div>
        )}
      </div>

      {/* Edit Job Card Dialog */}
      <Dialog open={!!editingJob} onOpenChange={(o) => !o && setEditingJob(null)}>
          <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight">Record Synchronization</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-6">
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lead Technician</Label>
                      <Select 
                          defaultValue={editingJob?.assignedMechanicId}
                          onValueChange={(val) => setEditingJob(j => j ? { ...j, assignedMechanicId: val } : null)}
                      >
                          <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none">
                              <SelectValue placeholder="Assign personnel..." />
                          </SelectTrigger>
                          <SelectContent>
                              {activeMechanics.map(m => (
                                  <SelectItem key={m.userId} value={m.userId} className="font-bold">{m.fullName}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workflow State</Label>
                          <Select 
                              defaultValue={editingJob?.status}
                              onValueChange={(val) => setEditingJob(j => j ? { ...j, status: val as any } : null)}
                          >
                              <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold">
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                  {Object.values(JobCardStatus).map(s => (
                                      <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base Labor (Ush)</Label>
                          <Input 
                              type="number"
                              defaultValue={editingJob?.laborCost}
                              onChange={(e) => setEditingJob(j => j ? { ...j, laborCost: parseFloat(e.target.value) } : null)}
                              className="h-11 rounded-xl bg-muted/50 border-none font-black text-primary"
                          />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Incident Description</Label>
                      <Textarea 
                          defaultValue={editingJob?.reportedIssue}
                          onChange={(e) => setEditingJob(j => j ? { ...j, reportedIssue: e.target.value } : null)}
                          className="rounded-xl min-h-[100px] bg-muted/50 border-none resize-none font-medium text-sm"
                      />
                  </div>
                  <Button className="w-full h-12 font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20" onClick={() => handleUpdateJob(editingJob!)}>
                      Commit Record Changes
                  </Button>
              </div>
          </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!jobToDelete} onOpenChange={(o) => !o && setJobToDelete(null)}>
          <AlertDialogContent className="rounded-3xl border-border/50">
              <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Purge Operational Record?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                      You are about to permanently decommission Job Card <span className="font-bold text-foreground">#{jobToDelete?.jobCardId.toUpperCase()}</span>. This will revoke all linked task logs and inventory allocations. This operation is forensic-grade and irreversible.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteJob} className="rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest text-[10px] h-11">Confirm Purge</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
