'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewInventoryItemDialog } from '@/components/inventory/new-inventory-item-dialog';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { InventoryCard } from '@/components/inventory/inventory-card';
import { StockMovementList } from '@/components/inventory/stock-movement-list';
import PageHeader from '@/components/layout/page-header';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { LoadingState } from '@/components/shared/loading-state';
import { 
    Warehouse, 
    Package, 
    AlertTriangle, 
    Banknote, 
    Search, 
    Filter,
    History as HistoryIcon,
    Activity,
    Layers,
    Tag,
    ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { InventoryItem } from '@/types/inventory';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

/**
 * @fileOverview Technical Stock Ledger terminal.
 * Provides a live view of the workshop's inventory equity and SKU levels.
 * Stabilized with useMemoFirebase for loop-resistant real-time sync.
 */
export default function InventoryPage() {
  const { role: currentRole, isLoading: authLoading } = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Authorization Check
  const canManage = useMemo(() => 
    ['Makros System Owner', 'Workshop Manager', 'Inventory Officer', 'Accountant'].includes(currentRole || ''),
  [currentRole]);

  const canRead = useMemo(() => 
    canManage || currentRole === 'Mechanic' || currentRole === 'Receptionist',
  [currentRole, canManage]);

  // Real-time stock collection - Stabilized with useMemoFirebase
  const inventoryQuery = useMemoFirebase(() => {
    if (!canRead || !db) return null;
    return query(collection(db, 'inventory'), orderBy('itemName', 'asc'));
  }, [db, canRead]);
  
  const { data: inventory, loading: collectionLoading } = useCollection<InventoryItem>(inventoryQuery as any);

  const categories = useMemo(() => {
    if (!inventory) return [];
    const cats = new Set(inventory.map(item => item.category).filter(Boolean));
    return Array.from(cats);
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    return inventory
        .filter(item => 
            item.itemName.toLowerCase().includes(search.toLowerCase()) || 
            (item.supplierId && item.supplierId.toLowerCase().includes(search.toLowerCase())) ||
            item.itemId.toLowerCase().includes(search.toLowerCase())
        )
        .filter(item => {
            if (filter === 'All') return true;
            if (filter === 'Low Stock') return item.quantity > 0 && item.quantity <= item.reorderLevel;
            if (filter === 'Out of Stock') return item.quantity === 0;
            return true;
        })
        .filter(item => {
            if (categoryFilter === 'All') return true;
            return item.category === categoryFilter;
        });
  }, [inventory, search, filter, categoryFilter]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, categoryFilter]);

  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredInventory.slice(startIndex, startIndex + pageSize);
  }, [filteredInventory, currentPage, pageSize]);

  const stats = useMemo(() => {
    if (!inventory) return { totalValue: 0, lowStock: 0, outOfStock: 0 };
    const totalValue = inventory.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0);
    const lowStock = inventory.filter(item => item.quantity > 0 && item.quantity <= item.reorderLevel).length;
    const outOfStock = inventory.filter(item => item.quantity === 0).length;
    return { totalValue, lowStock, outOfStock };
  }, [inventory]);

  if (authLoading || (canRead && collectionLoading)) return <LoadingState />;

  if (!canRead) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Access Restricted</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                    Inventory ledger access is limited to authorized workshop personnel.
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
      <PageHeader title="Stock & Logistics">
        <div className="flex items-center gap-3">
            {canManage && <NewInventoryItemDialog />}
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total SKUs</CardTitle>
            <Warehouse className="h-3.5 w-3.5 text-primary opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight'>{inventory?.length || 0}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Managed Inventory Units</p>
          </CardContent>
        </Card>

        <Card className="dashboard-gradient-blue border-none text-white overflow-hidden shadow-lg shadow-blue-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Equity Value</CardTitle>
            <Banknote className="h-3.5 w-3.5 opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight'><CurrencyFormat value={stats.totalValue} abbreviate /></p>
            <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Asset valuation at cost (Ush)</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Low Stock</CardTitle>
            <AlertTriangle className="h-3.5 w-3.5 text-orange-500 opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight text-orange-600'>{stats.lowStock}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Awaiting replenishment</p>
          </CardContent>
        </Card>

        <Card className={cn(
            "overflow-hidden border-none text-white transition-all shadow-lg",
            stats.outOfStock > 0 ? "dashboard-gradient-orange shadow-orange-500/20" : "bg-muted text-muted-foreground"
        )}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Critical Void</CardTitle>
            <Package className="h-3.5 w-3.5 opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight'>{stats.outOfStock}</p>
            <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Stockout items (Zero count)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-2xl">
                <div className="relative flex-grow w-full lg:max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search SKU name or reference..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-background h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm" 
                    />
                </div>
                <div class='flex flex-wrap items-center gap-3 w-full lg:w-auto'>
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground hidden sm:block" />
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[140px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50">
                                <SelectItem value="All">All Categories</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[160px]">
                                <SelectValue placeholder="Availability" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50">
                                <SelectItem value="All">Global Catalog</SelectItem>
                                <SelectItem value="Low Stock">Restock Required</SelectItem>
                                <SelectItem value="Out of Stock">Critical Shortage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5" /> Catalog Registry
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground/60">{filteredInventory.length} Records</span>
                </div>

                {!isMobile ? (
                    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                        <InventoryTable inventory={paginatedInventory} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {paginatedInventory.map(item => (
                            <InventoryCard key={item.itemId} item={item} />
                        ))}
                    </div>
                )}

                <DataTablePagination 
                    totalItems={filteredInventory.length}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                />
                
                {filteredInventory.length === 0 && (
                    <div className="py-32 text-center border-2 border-dashed rounded-[2.5rem] opacity-30 bg-muted/5">
                        <Package className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-sm font-medium italic">No catalog items match your search criteria.</p>
                    </div>
                )}
              </div>
          </div>

          <div className="lg:col-span-3 space-y-6 sticky top-24">
              <div className="bg-card border rounded-3xl overflow-hidden shadow-sm premium-shadow">
                  <div className="bg-muted/30 px-6 py-4 border-b flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                          <HistoryIcon className="h-3.5 w-3.5" /> Recent Shifts
                      </h4>
                  </div>
                  <StockMovementList />
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 relative overflow-hidden group">
                  <Activity className="absolute -right-4 -bottom-4 h-16 w-16 text-primary/5 group-hover:scale-110 transition-transform duration-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                      <Activity className="h-3 w-3" /> Replenishment Logic
                  </h4>
                  <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
                      Stock levels are monitored against reorder thresholds to prevent workshop downtime. Transactions are atomic to ensure ledger integrity.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
}
