'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PlantEquipment, PlantStatus } from '@/types/plant-equipment';
import { Customer } from '@/types/customer';
import { JobCard } from '@/types/job-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Plus, 
    ShieldCheck, 
    Activity, 
    Search, 
    Filter, 
    Wrench,
    Clock,
    LayoutGrid,
    List,
    Hammer,
    ShieldAlert
} from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { NewPlantDialog } from '@/components/plants-equipment/new-plant-dialog';
import { PlantTable } from '@/components/plants-equipment/plant-table';
import { PlantCard } from '@/components/plants-equipment/plant-card';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { UpdateMeterDialog } from '@/components/plants-equipment/update-meter-dialog';
import { EditPlantDialog } from '@/components/plants-equipment/edit-plant-dialog';

/**
 * @fileOverview Industrial Plant & Equipment Registry Dashboard.
 * Orchestrates technical machinery management with full lifecycle command support.
 * Synchronized with the Polymorphic Workshop core.
 */
export default function PlantsPage() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const router = useRouter();
    const { role, isLoading: authLoading } = useAuth();
    const db = useFirestore();

    const isAuthorized = useMemo(() => 
        ['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Senior Mechanic / Lead Mechanic', 'Inventory Officer'].includes(role || '')
    , [role]);

    // Redirection Protocol
    useEffect(() => {
        if (!authLoading && !isAuthorized) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthorized, router]);

    // UI States for Lifecycle Actions
    const [selectedPlantForAction, setSelectedPlantForAction] = useState<PlantEquipment | null>(null);
    const [isUpdateMeterOpen, setIsUpdateMeterOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Real-time Technical Streams
    const plantsQuery = useMemoFirebase(() => {
        if (!db || !isAuthorized) return null;
        return query(collection(db, 'plantsAndEquipment'), orderBy('createdAt', 'desc'));
    }, [db, isAuthorized]);
    
    const customersQuery = useMemoFirebase(() => query(collection(db, 'customers')), [db]);

    const { data: plants, loading: pLoading } = useCollection<PlantEquipment>(plantsQuery as any);
    const { data: customers, loading: cLoading } = useCollection<Customer>(customersQuery as any);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>(isMobile ? 'grid' : 'table');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const isLoading = pLoading || cLoading;

    const stats = useMemo(() => {
        if (!plants) return { total: 0, active: 0, underRepair: 0, maintenanceDue: 0 };
        const total = plants.length;
        const active = plants.filter(p => p.status === 'Active').length;
        const underRepair = plants.filter(p => p.status === 'Under Repair').length;
        const maintenanceDue = plants.filter(p => p.status === 'Under Maintenance').length;
        return { total, active, underRepair, maintenanceDue };
    }, [plants]);

    const filteredPlants = useMemo(() => {
        if (!plants) return [];
        return plants.filter(p => {
            const customer = customers?.find(c => c.customerId === p.ownerId);
            const matchesSearch = 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [plants, searchTerm, statusFilter, customers]);

    const paginatedPlants = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPlants.slice(start, start + pageSize);
    }, [filteredPlants, currentPage, pageSize]);

    // Handle Page Resets
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // Action Dispatchers
    const handleOpenUpdateMeter = (plant: PlantEquipment) => {
        setSelectedPlantForAction(plant);
        setIsUpdateMeterOpen(true);
    };

    const handleOpenEdit = (plant: PlantEquipment) => {
        setSelectedPlantForAction(plant);
        setIsEditOpen(true);
    };

    if (authLoading || (!isAuthorized && !authLoading)) return <LoadingState />;
    if (isLoading) return <LoadingState />;

    if (!isAuthorized) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <PageHeader title="Plant & Equipment">
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
                    <Button 
                        onClick={() => setIsCreateOpen(true)}
                        className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" /> Enroll Plant
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="dashboard-gradient-blue border-none text-white overflow-hidden relative shadow-lg shadow-blue-500/20 group">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Global Fleet</CardTitle>
                        <Hammer className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:scale-110" />
                    </CardHeader>
                    <CardContent>
                        <p className='text-3xl font-black tracking-tight'>{stats.total}</p>
                        <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Registered Assets</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active Duty</CardTitle>
                        <ShieldCheck className="h-3.5 w-3.5 text-green-500 opacity-50" />
                    </CardHeader>
                    <CardContent>
                        <p className='text-3xl font-black tracking-tight text-green-600'>{stats.active}</p>
                        <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Operational Units</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Technical Bay</CardTitle>
                        <Wrench className="h-3.5 w-3.5 text-orange-500 opacity-50" />
                    </CardHeader>
                    <CardContent>
                        <p className='text-3xl font-black tracking-tight text-orange-600'>{stats.underRepair}</p>
                        <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>In Repair Cycle</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Maintenance</CardTitle>
                        <Clock className="h-3.5 w-3.5 text-indigo-500 opacity-50" />
                    </CardHeader>
                    <CardContent>
                        <p className='text-3xl font-black tracking-tight text-indigo-600'>{stats.maintenanceDue}</p>
                        <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Scheduled intervals</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                <div className="relative w-full lg:max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search by name, Asset ID, serial, or owner..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm" 
                    />
                </div>
                <div className='flex items-center gap-3 w-full lg:w-auto'>
                    <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[160px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">Global Fleet</SelectItem>
                            <SelectItem value="Active">Active Duty</SelectItem>
                            <SelectItem value="Under Repair">In Bay</SelectItem>
                            <SelectItem value="Under Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Out of Service">Out of Service</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5" /> Registry Load
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground/60">{filteredPlants.length} Records found</span>
                </div>

                {viewMode === 'table' ? (
                    <PlantTable 
                        plants={paginatedPlants} 
                        customers={customers || []} 
                        onUpdateMeter={handleOpenUpdateMeter}
                        onEdit={handleOpenEdit}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedPlants.map(p => (
                            <PlantCard 
                                key={p.id} 
                                plant={p} 
                                ownerName={customers?.find(c => c.customerId === p.ownerId)?.fullName || 'Registry Void'} 
                                onUpdateMeter={handleOpenUpdateMeter}
                                onEdit={handleOpenEdit}
                            />
                        ))}
                    </div>
                )}

                <DataTablePagination 
                    totalItems={filteredPlants.length}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </div>

            <NewPlantDialog 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                customers={customers || []}
            />

            {selectedPlantForAction && (
                <>
                    <UpdateMeterDialog 
                        plant={selectedPlantForAction} 
                        isOpen={isUpdateMeterOpen} 
                        onClose={() => { setIsUpdateMeterOpen(false); setSelectedPlantForAction(null); }} 
                    />
                    <EditPlantDialog 
                        plant={selectedPlantForAction} 
                        isOpen={isEditOpen} 
                        onClose={() => { setIsEditOpen(false); setSelectedPlantForAction(null); }} 
                    />
                </>
            )}
        </div>
    );
}
