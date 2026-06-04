'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle
} from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { SupplierForm } from '@/components/suppliers/supplier-form';
import { SuppliersTable } from '@/components/suppliers/suppliers-table';
import { SupplierCard } from '@/components/suppliers/supplier-card';
import { SupplierProfile } from '@/components/suppliers/supplier-profile';
import { Supplier } from '@/types/supplier';
import { InventoryItem } from '@/types/inventory';
import { SupplierPermissionsProvider, useSupplierPermissions, hasSupplierPermission } from '@/lib/supplier-permissions';
import { Plus, Search, Filter, Truck, Banknote, AlertTriangle, Users, Activity, ShieldCheck, Layers } from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LoadingState } from '@/components/shared/loading-state';
import { createSupplier, updateSupplier, deactivateSupplier } from '@/services/suppliers-service';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

const SuppliersPageContent = () => {
  const { user: currentUser } = useAuth();
  const db = useFirestore();
  const userPermissions = useSupplierPermissions();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const canViewSuppliers = useMemo(() => 
    hasSupplierPermission(userPermissions, 'view') || hasSupplierPermission(userPermissions, 'view_name'),
  [userPermissions]);

  // Real-time Firestore Streams - Stabilized
  const suppliersQuery = useMemoFirebase(() => {
    if (!canViewSuppliers || !db) return null;
    return query(collection(db, 'suppliers'), orderBy('supplierName', 'asc'));
  }, [db, canViewSuppliers]);

  const inventoryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'inventory'));
  }, [db]);

  const { data: suppliers, loading: supLoading } = useCollection<Supplier>(suppliersQuery as any);
  const { data: inventory, loading: invLoading } = useCollection<InventoryItem>(inventoryQuery as any);

  const selectedSupplier = useMemo(() => {
    if (!suppliers) return null;
    return suppliers.find(s => s.supplierId === selectedSupplierId || (s as any).id === selectedSupplierId) || null;
  }, [suppliers, selectedSupplierId]);

  const supplierInventoryMetrics = useMemo(() => {
    if (!suppliers || !inventory) return [];
    return suppliers.map(supplier => {
      const id = supplier.supplierId || (supplier as any).id;
      const itemsSupplied = inventory.filter(item => item.supplierId === id);
      const lowStockItems = itemsSupplied.filter(item => item.quantity <= item.reorderLevel);
      const stockValue = itemsSupplied.reduce((total, item) => total + (item.purchasePrice * item.quantity), 0);
      return {
        supplierId: id,
        itemsSuppliedCount: itemsSupplied.length,
        lowStockItemsCount: lowStockItems.length,
        stockValue: stockValue,
      };
    });
  }, [suppliers, inventory]);

  const stats = useMemo(() => {
    if (!suppliers || !supplierInventoryMetrics.length) return { totalValue: 0, lowStockAlerts: 0, activePartners: 0 };
    const totalValue = supplierInventoryMetrics.reduce((sum, m) => sum + m.stockValue, 0);
    const lowStockAlerts = supplierInventoryMetrics.reduce((sum, m) => sum + m.lowStockItemsCount, 0);
    const activePartners = suppliers.filter(s => s.status === 'Active').length;
    return { totalValue, lowStockAlerts, activePartners };
  }, [supplierInventoryMetrics, suppliers]);
  
  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];
    return suppliers
        .map(supplier => {
            const id = supplier.supplierId || (supplier as any).id;
            const metrics = supplierInventoryMetrics.find(m => m.supplierId === id);
            return {...supplier, ...metrics};
        })
        .filter(supplier =>
            (supplier.supplierName.toLowerCase().includes(search.toLowerCase()) ||
            (supplier.supplierId || (supplier as any).id).toLowerCase().includes(search.toLowerCase())) &&
            (statusFilter === 'All' || supplier.status === statusFilter)
        );
  }, [suppliers, supplierInventoryMetrics, search, statusFilter]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(startIndex, startIndex + pageSize);
  }, [filteredSuppliers, currentPage, pageSize]);

  const handleFormSubmit = async (data: any) => {
    if (!currentUser) return;
    
    try {
      if (editingSupplier) {
          updateSupplier(editingSupplier.supplierId || (editingSupplier as any).id, data, currentUser.userId);
          toast({ title: "Partner Record Synchronized", description: `${data.supplierName} details updated.` });
      } else {
          createSupplier(data, currentUser.userId);
          toast({ title: "New Partner Enrolled", description: `${data.supplierName} added to registry.` });
      }
      setIsFormOpen(false);
      setEditingSupplier(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Operation Failed", description: error.message });
    }
  };

  const openEditForm = (supplier: Supplier) => {
      setEditingSupplier(supplier);
      setIsFormOpen(true);
  };

  const handleToggleStatus = async (supplierId: string) => {
    if (!currentUser || !suppliers) return;
    const supplier = suppliers.find(s => (s.supplierId === supplierId || (s as any).id === supplierId));
    if (!supplier) return;
    
    const newStatus = supplier.status === 'Active' ? 'Inactive' : 'Active';
    updateSupplier(supplierId, { status: newStatus }, currentUser.userId);
    toast({ title: "Status Synchronized", description: `${supplier.supplierName} is now ${newStatus}.` });
  };

  const handleDelete = async () => {
    if (supplierToDelete && currentUser) {
        deactivateSupplier(supplierToDelete.supplierId || (supplierToDelete as any).id, currentUser.userId);
        toast({ title: "Account Deactivated", description: `${supplierToDelete.supplierName} record has been closed.` });
        setSupplierToDelete(null);
    }
  };

  // Set initial selection (Desktop only)
  useMemo(() => {
    if (!isMobile && !selectedSupplierId && filteredSuppliers.length > 0) {
        setSelectedSupplierId(filteredSuppliers[0].supplierId || (filteredSuppliers[0] as any).id);
    }
  }, [filteredSuppliers, selectedSupplierId, isMobile]);
  
  if (supLoading || invLoading) return <LoadingState />;

  if (!canViewSuppliers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-20 border-2 border-dashed rounded-[2.5rem] opacity-40">
          <Truck className="h-12 w-12 mx-auto mb-4" />
          <p className="text-sm font-black uppercase tracking-widest">Access Restricted</p>
          <p className="text-xs font-medium italic">Personnel registry clearance required for supply chain logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-32">
        <PageHeader title="Vendor Registry">
            {hasSupplierPermission(userPermissions, 'create') && (
                <Button onClick={() => { setEditingSupplier(null); setIsFormOpen(true); }} className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                    <Plus className="h-4 w-4" /> Enroll Provider
                </Button>
            )}
        </PageHeader>

        {/* Global Partner Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm rounded-[2rem]">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Active Partners</CardTitle>
                    <Users className="h-4 w-4 text-green-500 opacity-50 transition-transform group-hover:scale-110" />
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-4xl font-black tracking-tighter text-green-600">{stats.activePartners}</div>
                    <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Verified Supply Units</p>
                </CardContent>
            </Card>

            <Card className="dashboard-gradient-blue border-none text-white overflow-hidden shadow-xl shadow-blue-500/20 rounded-[2rem] relative group">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Supply Equity</CardTitle>
                    <Banknote className="h-4 w-4 opacity-50" />
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-4xl font-black tracking-tighter"><CurrencyFormat value={stats.totalValue} abbreviate /></div>
                    <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Asset value in Ush</p>
                </CardContent>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
            </Card>

            <Card className="bg-card border-border/50 overflow-hidden group shadow-sm rounded-[2rem]">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Stock Risks</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500 opacity-50" />
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-4xl font-black tracking-tighter text-orange-600">{stats.lowStockItemsCount}</div>
                    <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Replenishment Alerts</p>
                </CardContent>
            </Card>

            <Card className="bg-card border-border/50 overflow-hidden group shadow-sm rounded-[2rem]">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Operational</CardTitle>
                    <Activity className="h-4 w-4 text-indigo-500 opacity-50" />
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-4xl font-black tracking-tighter text-indigo-600">100%</div>
                    <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>SLA Compliance</p>
                </CardContent>
            </Card>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-3xl">
            <div className="relative flex-grow w-full lg:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search providers by legal name or technical identifier..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-11 bg-background h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm border-none font-medium"
                />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background h-12 rounded-2xl shadow-sm min-w-[180px] border-none font-bold uppercase text-[10px] tracking-widest">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="All" className="text-[10px] font-bold uppercase">Global Registry</SelectItem>
                        <SelectItem value="Active" className="text-[10px] font-bold uppercase">Active Partnerships</SelectItem>
                        <SelectItem value="Inactive" className="text-[10px] font-bold uppercase">Decommissioned</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className={cn(
                "space-y-6 transition-all duration-500",
                selectedSupplier && !isMobile ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12"
            )}>
                <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5" /> Partner Registry
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground/60">{filteredSuppliers.length} Trace Records Found</span>
                </div>

                {!isMobile ? (
                    <div className="rounded-3xl border bg-card overflow-hidden shadow-sm premium-shadow">
                        <SuppliersTable 
                            suppliers={paginatedSuppliers} 
                            permissions={userPermissions}
                            onViewProfile={(s) => setSelectedSupplierId(s.supplierId || (s as any).id)}
                            onEdit={openEditForm}
                            onDeactivate={handleToggleStatus}
                            onDelete={setSupplierToDelete}
                            selectedId={selectedSupplierId}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {paginatedSuppliers.map(supplier => (
                            <SupplierCard 
                                key={supplier.supplierId || (supplier as any).id} 
                                supplier={supplier} 
                                permissions={userPermissions}
                                onViewProfile={(s) => setSelectedSupplierId(s.supplierId || (s as any).id)}
                                onEdit={openEditForm}
                                onDeactivate={handleToggleStatus}
                                onDelete={setSupplierToDelete}
                            />
                        ))}
                    </div>
                )}

                <DataTablePagination 
                    totalItems={filteredSuppliers.length}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                />
                
                {filteredSuppliers.length === 0 && (
                    <div className="py-32 text-center border-2 border-dashed rounded-[3rem] opacity-30 bg-muted/5 flex flex-col items-center">
                        <Truck className="h-12 w-12 mb-4" />
                        <p className="text-sm font-medium italic">No verified suppliers matching your current query.</p>
                    </div>
                )}
            </div>

            {/* Desktop Dossier Inspector */}
            {selectedSupplier && !isMobile && (
                <div className="lg:col-span-4 xl:col-span-3 sticky top-24 animate-in slide-in-from-right-4 duration-500">
                    <SupplierProfile 
                        supplier={selectedSupplier}
                        inventory={inventory?.filter(i => i.supplierId === (selectedSupplier.supplierId || (selectedSupplier as any).id)) || []}
                        onClose={() => setSelectedSupplierId(null)} 
                    />
                </div>
            )}
        </div>

        {/* Enrollment Modal */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50 bg-background rounded-3xl">
                <DialogHeader className="px-8 pt-8 pb-4 text-left border-b">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">{editingSupplier ? 'Record Synchronization' : 'Partner Enrollment'}</DialogTitle>
                </DialogHeader>
                <div className="flex min-h-0 flex-1 flex-col">
                    <SupplierForm 
                        onSubmit={handleFormSubmit} 
                        supplier={editingSupplier} 
                    />
                </div>
            </DialogContent>
        </Dialog>

        {/* Decommission Confirmation */}
        <AlertDialog open={!!supplierToDelete} onOpenChange={(o) => !o && setSupplierToDelete(null)}>
            <AlertDialogContent className="rounded-[2.5rem] border-border/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Deactivate Partner Authority?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                        This action will mark <span className="font-bold text-foreground">{supplierToDelete?.supplierName}</span> as Inactive. Historical procurement logs will be preserved, but new technical intakes from this vendor will be restricted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest text-[10px] h-12 border-none text-white shadow-xl shadow-destructive/20">Confirm Deactivation</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Mobile Dossier Drawer */}
        <Drawer open={isMobile && !!selectedSupplierId} onOpenChange={(open) => !open && setSelectedSupplierId(null)}>
            <DrawerContent className="max-h-[92dvh] flex flex-col">
                <DrawerHeader className="border-b shrink-0 text-left px-8 py-6">
                    <DrawerTitle className="font-black uppercase tracking-tight">Partner Dossier</DrawerTitle>
                    <DrawerDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Technical profile and catalog fulfillment history.</DrawerDescription>
                </DrawerHeader>
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {selectedSupplier && (
                        <SupplierProfile 
                            supplier={selectedSupplier}
                            inventory={inventory?.filter(i => i.supplierId === (selectedSupplier.supplierId || (selectedSupplier as any).id)) || []}
                            onClose={() => setSelectedSupplierId(null)} 
                        />
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    </div>
  );
};

export default function SuppliersPage() {
  return (
    <SupplierPermissionsProvider>
      <SuppliersPageContent />
    </SupplierPermissionsProvider>
  );
}
