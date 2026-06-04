'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { MakrosService, ServiceCategory, ServiceStatus } from '@/types/makros-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
} from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PlusCircle, Search, Filter, Wrench, Activity, Layers, BarChart3, Clock, ShieldCheck, Tag } from 'lucide-react';
import ServiceForm from '@/components/services/service-form';
import { ServicesTable } from '@/components/services/services-table';
import ServiceCard from '@/components/services/service-card';
import ServiceProfile from '@/components/services/service-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/loading-state';
import { createService, updateService, deleteService } from '@/services/services-service';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

/**
 * @fileOverview Technical Directory for Workshop Services.
 * Features a high-density registry with real-time performance analytics.
 */
export default function ServicesPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 1024px)");

  // Real-time Catalog Stream - Stabilized
  const servicesQuery = useMemoFirebase(() => query(collection(db, 'services'), orderBy('serviceName', 'asc')), [db]);
  const { data: services, loading } = useCollection<MakrosService>(servicesQuery as any);

  // Usage Stats Stream (Job Cards & Bookings)
  const jobCardsQuery = useMemoFirebase(() => query(collection(db, 'jobCards')), [db]);
  const bookingsQuery = useMemoFirebase(() => query(collection(db, 'bookings')), [db]);
  
  const { data: jobCards } = useCollection<any>(jobCardsQuery as any);
  const { data: bookings } = useCollection<any>(bookingsQuery as any);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');
  
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<MakrosService | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isManager = useMemo(() => {
    return currentUser && ['Makros System Owner', 'Workshop Manager'].includes(currentUser.role);
  }, [currentUser]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    return services.filter((s) => {
      const matchesSearch = s.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.serviceId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [services, searchTerm, statusFilter, categoryFilter]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredServices.slice(startIndex, startIndex + pageSize);
  }, [filteredServices, currentPage, pageSize]);

  const selectedService = useMemo(() => {
      return services?.find(s => s.serviceId === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  const handleFormSubmit = async (data: any) => {
    if (!currentUser) return;
    
    if (selectedService) {
      updateService(selectedService.serviceId, data);
      toast({ title: "Catalog Updated", description: "Technical specifications synchronized." });
    } else {
      createService(data);
      toast({ title: "Entry Enrolled", description: "New service successfully added to catalog." });
    }
    setIsFormOpen(false);
  };

  const handleToggleStatus = (service: MakrosService) => {
    const newStatus: ServiceStatus = service.status === 'Active' ? 'Inactive' : 'Active';
    updateService(service.serviceId, { status: newStatus });
    toast({ title: "Status Shifted", description: `${service.serviceName} is now ${newStatus}.` });
  };

  const handleDelete = () => {
    if (serviceToDelete) {
        deleteService(serviceToDelete.serviceId);
        toast({ title: "Entry Purged", description: "Catalog record decommissioned." });
        setServiceToDelete(null);
    }
  };

  if (loading || authLoading) return <LoadingState />;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-32">
      <PageHeader title="Service Catalog">
        <div className="flex items-center gap-3">
            {isManager && (
                <Button onClick={() => { setSelectedServiceId(null); setIsFormOpen(true); }} className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                    <PlusCircle className="h-4 w-4" /> Add Catalog Item
                </Button>
            )}
        </div>
      </PageHeader>

      {/* Directory Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm rounded-[2rem]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Active Units</CardTitle>
            <Activity className="h-4 w-4 text-green-500 opacity-50 transition-transform group-hover:scale-110" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className='text-4xl font-black tracking-tighter text-green-600'>{services?.filter(s => s.status === 'Active').length || 0}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Verified Operational</p>
          </CardContent>
        </Card>

        <Card className="dashboard-gradient-blue border-none text-white overflow-hidden shadow-xl shadow-blue-500/20 rounded-[2rem] relative group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Catalog Depth</CardTitle>
            <Layers className="h-4 w-4 opacity-50" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className='text-4xl font-black tracking-tighter'>{services?.length || 0}</p>
            <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Global Record Count</p>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm rounded-[2rem]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Demand Density</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-500 opacity-50" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className='text-4xl font-black tracking-tighter text-indigo-600'>{bookings?.length || 0}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Lifetime Intakes</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm rounded-[2rem]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Compliance</CardTitle>
            <ShieldCheck className="h-4 w-4 text-amber-500 opacity-50" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className='text-4xl font-black tracking-tighter text-amber-600'>100%</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Fidelity Index</p>
          </CardContent>
        </Card>
      </div>

      {/* Directory Terminal */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-muted/30 p-4 rounded-3xl border border-border/50">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search catalog by keyword or reference ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-background h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm border-none font-medium" 
          />
        </div>
        <div className='flex flex-wrap items-center gap-3 w-full lg:w-auto'>
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <Activity className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ServiceStatus | 'all')}>
              <SelectTrigger className="bg-background h-12 rounded-2xl shadow-sm min-w-[150px] border-none font-bold uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="all" className="text-[10px] font-bold uppercase">System States</SelectItem>
                  <SelectItem value="Active" className="text-[10px] font-bold uppercase">Active Duty</SelectItem>
                  <SelectItem value="Inactive" className="text-[10px] font-bold uppercase">Decommissioned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <Tag className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ServiceCategory | 'all')}>
              <SelectTrigger className="bg-background h-12 rounded-2xl shadow-sm min-w-[200px] border-none font-bold uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="all" className="text-[10px] font-bold uppercase">Global Catalog</SelectItem>
                  {["General Service", "Diagnostics", "Engine", "Brakes", "Suspension", "Tyres", "Battery", "Car Wash", "Body Works", "Electrical", "Other"].map(cat => (
                      <SelectItem key={cat} value={cat} className="text-[10px] font-bold uppercase">{cat}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Registry Table/Grid */}
        <div className={cn(
            "space-y-6 transition-all duration-500",
            selectedService && !isMobile ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12"
        )}>
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" /> Service Registry
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground/60">{filteredServices.length} Trace Records</span>
            </div>

            {!isMobile ? (
                <div className="rounded-3xl border bg-card overflow-hidden shadow-sm premium-shadow">
                    <ServicesTable
                        services={paginatedServices}
                        onEdit={(s) => { setSelectedServiceId(s.serviceId); setIsFormOpen(true); }}
                        onView={(s) => setSelectedServiceId(s.serviceId)}
                        onToggleStatus={handleToggleStatus}
                        onDelete={setServiceToDelete}
                        selectedId={selectedServiceId}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {paginatedServices.map((service) => (
                        <ServiceCard 
                            key={service.serviceId} 
                            service={service} 
                            onEdit={(s) => { setSelectedServiceId(s.serviceId); setIsFormOpen(true); }} 
                            onView={(s) => setSelectedServiceId(s.serviceId)} 
                        />
                    ))}
                </div>
            )}

            <DataTablePagination 
                totalItems={filteredServices.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />

            {filteredServices.length === 0 && (
                <div className="py-32 text-center border-2 border-dashed rounded-[3rem] opacity-30 bg-muted/5 flex flex-col items-center">
                    <Layers className="h-12 w-12 mb-4" />
                    <p className="text-sm font-medium italic">No catalog entries found matching your operational query.</p>
                </div>
            )}
        </div>

        {/* Technical Analysis Dossier Sidebar */}
        {selectedService && !isMobile && (
            <div className="lg:col-span-4 xl:col-span-3 sticky top-24 animate-in slide-in-from-right-4 duration-500">
                <ServiceProfile 
                    service={selectedService}
                    linkedBookings={bookings?.filter(b => b.serviceId === selectedService.serviceId).length || 0}
                    linkedJobCards={jobCards?.filter(jc => jc.serviceId === selectedService.serviceId).length || 0}
                    estimatedServiceRevenue={jobCards?.filter(jc => jc.serviceId === selectedService.serviceId).reduce((acc: number, j: any) => acc + (j.laborCost || 0), 0) || 0}
                    onClose={() => setSelectedServiceId(null)}
                />
            </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[500px] border-border/50 bg-background rounded-3xl">
          <DialogHeader className="px-8 pt-8 pb-4 text-left border-b">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">{selectedService ? 'Update Catalog Record' : 'New Catalog Entry'}</DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col">
              <ServiceForm
                  onSubmit={handleFormSubmit}
                  initialData={selectedService ?? undefined}
              />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
          <AlertDialogContent className="rounded-[2.5rem] border-border/50">
              <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Purge Catalog Record?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                      You are about to permanently decommission <span className="font-bold text-foreground">{serviceToDelete?.serviceName}</span> from the workshop directory. This will not affect existing historical logs but will prevent new intakes for this category. This action is irreversible.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest text-[10px] h-12 border-none text-white shadow-xl shadow-destructive/20">Confirm Purge</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Details Drawer */}
      <Drawer open={isMobile && !!selectedServiceId} onOpenChange={(open) => !open && setSelectedServiceId(null)}>
        <DrawerContent className="max-h-[92dvh] flex flex-col">
            <DrawerHeader className="border-b shrink-0 text-left px-8 py-6">
                <DrawerTitle className="font-black uppercase tracking-tight">Service Dossier</DrawerTitle>
                <DrawerDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Technical specifications and historical performance.</DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 min-h-0 overflow-y-auto">
                {selectedService && (
                    <ServiceProfile 
                        service={selectedService}
                        linkedBookings={bookings?.filter(b => b.serviceId === selectedService.serviceId).length || 0}
                        linkedJobCards={jobCards?.filter(jc => jc.serviceId === selectedService.serviceId).length || 0}
                        estimatedServiceRevenue={jobCards?.filter(jc => jc.serviceId === selectedService.serviceId).reduce((acc: number, j: any) => acc + (j.laborCost || 0), 0) || 0}
                        onClose={() => setSelectedServiceId(null)}
                    />
                )}
            </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
