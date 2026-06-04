
'use client';

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Vehicle } from '@/types/vehicle';
import { Customer } from '@/types/customer';
import { JobCard } from '@/types/job-card';
import { Button } from '@/components/ui/button';
import { 
    Plus, 
    Car, 
    ShieldCheck, 
    Activity, 
    Search, 
    Filter, 
    Fingerprint, 
    AlertCircle, 
    MoreHorizontal,
    Edit,
    Power,
    PowerOff,
    Eye,
    LayoutGrid,
    List,
    Trash2
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/layout/page-header';
import { NewVehicleDialog } from '@/components/vehicles/new-vehicle-dialog';
import { EditVehicleDialog } from '@/components/vehicles/edit-vehicle-dialog';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { LoadingState } from '@/components/shared/loading-state';
import { decommissionVehicle, updateVehicle, deleteVehicleRecord } from '@/services/vehicles-service';

export default function VehiclesPage() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { toast } = useToast();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const db = useFirestore();

    const vehiclesQuery = useMemoFirebase(() => query(collection(db, 'vehicles'), orderBy('createdAt', 'desc')), [db]);
    const customersQuery = useMemoFirebase(() => query(collection(db, 'customers')), [db]);
    const jobsQuery = useMemoFirebase(() => query(collection(db, 'jobCards')), [db]);

    const { data: vehicles, loading: vehLoading } = useCollection<Vehicle>(vehiclesQuery as any);
    const { data: customers, loading: custLoading } = useCollection<Customer>(customersQuery as any);
    const { data: jobCards, loading: jobLoading } = useCollection<JobCard>(jobsQuery as any);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>(isMobile ? 'grid' : 'table');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

    const isLoading = vehLoading || custLoading || jobLoading;

    const stats = useMemo(() => {
        if (!vehicles) return { total: 0, active: 0, inWorkshop: 0, maintenanceAlerts: 0 };
        const total = vehicles.length;
        const active = vehicles.filter(v => v.status !== 'Inactive').length;
        const inWorkshop = jobCards?.filter(jc => !['Completed', 'Cancelled', 'Delivered', 'Paid'].includes(jc.status)).length || 0;
        const maintenanceAlerts = vehicles.filter(v => v.mileage && v.mileage > 100000).length;
        
        return { total, active, inWorkshop, maintenanceAlerts };
    }, [vehicles, jobCards]);

    const filteredVehicles = useMemo(() => {
        if (!vehicles) return [];
        return vehicles.filter(v => {
            const customer = customers?.find(c => (c.customerId === v.customerId));
            const matchesSearch = 
                v.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'All' || v.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [vehicles, searchTerm, statusFilter, customers]);

    const getCustomerName = (customerId: string) => {
        return customers?.find(c => (c.customerId === customerId))?.fullName || 'Unknown Owner';
    };

    const handleDeactivate = (id: string) => {
        if (!currentUser) return;
        decommissionVehicle(id, currentUser.userId);
        toast({ title: "Registry Updated", description: "Vehicle marked as out-of-service." });
    };

    const handleActivate = (id: string) => {
        if (!currentUser) return;
        updateVehicle(id, { status: 'Active' }, currentUser.userId);
        toast({ title: "Registry Updated", description: "Vehicle restored to active duty." });
    };

    const handleDelete = () => {
        if (vehicleToDelete && currentUser) {
            deleteVehicleRecord(vehicleToDelete.vehicleId, currentUser.userId);
            toast({ title: "Asset Decommissioned", description: `${vehicleToDelete.make} ${vehicleToDelete.model} has been removed from registry.` });
            setVehicleToDelete(null);
        }
    };

    if (isLoading) return <LoadingState />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <PageHeader title="Vehicle Registry">
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
                        <Plus className="h-4 w-4" /> Register Asset
                    </Button>
                </div>
            </PageHeader>

            {/* Fleet Analytics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="dashboard-gradient-blue border-none text-white overflow-hidden relative shadow-lg shadow-blue-500/20 group">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Fleet</CardTitle>
                        <Car className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:scale-110" />
                    </CardHeader>
                    <CardContent>
                        <p className='text-3xl font-black tracking-tight'>{stats.total}</p>
                        <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Registered Assets</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Workshop Load</CardTitle>
                        <Activity className="h-3.5 w-3.5 text-primary opacity-50" />
                    </CardHeader>
                    <CardContent>
                        <p className='text-3xl font-black tracking-tight text-primary'>{stats.inWorkshop}</p>
                        <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Active Bay Repairs</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Operational</CardTitle>
                        <ShieldCheck className="h-3.5 w-3.5 text-green-500 opacity-50" />
                    </CardHeader>
                    <CardContent>
                        <p className='text-3xl font-black tracking-tight text-green-600'>{stats.active}</p>
                        <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Verified Units</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 overflow-hidden relative group shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">High Mileage</CardTitle>
                        <AlertCircle className="h-3.5 w-3.5 text-orange-500 opacity-50" />
                    </CardHeader>
                    <CardContent>
                        <p className='text-3xl font-black tracking-tight text-orange-600'>{stats.maintenanceAlerts}</p>
                        <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Service Drifts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Registry Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                <div className="relative w-full lg:max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search by plate, owner, make or VIN reference..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm" 
                    />
                </div>
                <div className='flex items-center gap-3 w-full lg:w-auto'>
                    <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[160px]">
                            <SelectValue placeholder="All Units" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">Global Fleet</SelectItem>
                            <SelectItem value="Active">Active Duty</SelectItem>
                            <SelectItem value="Inactive">Out of Service</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Fleet View */}
            {viewMode === 'table' && !isMobile ? (
                <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em]">
                                <TableHead className="w-[300px]">Vehicle Identity</TableHead>
                                <TableHead>Ownership</TableHead>
                                <TableHead>Technical Ref</TableHead>
                                <TableHead>Registry Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVehicles.map((vehicle) => (
                                <TableRow 
                                    key={vehicle.vehicleId} 
                                    className="cursor-pointer hover:bg-muted/30 transition-all group"
                                    onClick={() => router.push(`/vehicles/${vehicle.vehicleId}`)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/5">
                                                <Car className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-black group-hover:text-primary transition-colors uppercase tracking-tight leading-none">
                                                    {vehicle.make} {vehicle.model}
                                                </p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <Badge variant="outline" className="text-[10px] font-mono font-black text-primary bg-primary/5 px-2 py-0 border-primary/10 rounded uppercase">
                                                        {vehicle.numberPlate}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-foreground/80">{getCustomerName(vehicle.customerId)}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Registered Client</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Fingerprint className="h-3 w-3 text-muted-foreground/50" />
                                                <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-tight">
                                                    VIN: {vehicle.vin?.slice(-12).toUpperCase() || 'NOT_RECORDED'}
                                                </span>
                                            </div>
                                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Mfg Cycle: {vehicle.year || 'N/A'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={vehicle.status === 'Inactive' ? 'destructive' : 'success'} className="text-[9px] font-black uppercase tracking-widest px-2.5 shadow-sm">
                                            {vehicle.status || 'Active Duty'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-48">
                                                <DropdownMenuItem onClick={() => router.push(`/vehicles/${vehicle.vehicleId}`)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                                    <Eye className="h-3.5 w-3.5" /> Inspect Dossier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setEditingVehicle(vehicle)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                                    <Edit className="h-3.5 w-3.5" /> Update Record
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {vehicle.status === 'Inactive' ? (
                                                    <DropdownMenuItem onClick={() => handleActivate(vehicle.vehicleId)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-green-600">
                                                        <Power className="h-3.5 w-3.5" /> Restore Duty
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleDeactivate(vehicle.vehicleId)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive">
                                                        <PowerOff className="h-3.5 w-3.5" /> Deactivate Record
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => setVehicleToDelete(vehicle)} 
                                                    className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" /> Delete Asset
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map(v => (
                        <VehicleCard 
                            key={v.vehicleId} 
                            vehicle={v} 
                            ownerName={getCustomerName(v.customerId)}
                            onView={(id) => router.push(`/vehicles/${id}`)}
                            onEdit={setEditingVehicle}
                            onDeactivate={handleDeactivate}
                            onActivate={handleActivate}
                            onDelete={() => setVehicleToDelete(v)}
                        />
                    ))}
                </div>
            )}

            {filteredVehicles.length === 0 && (
                <div className="py-32 text-center border-2 border-dashed rounded-[2.5rem] opacity-30 bg-muted/5">
                    <Car className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-sm font-medium italic">No assets found matching your registry query.</p>
                </div>
            )}

            <NewVehicleDialog 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
            />

            {editingVehicle && (
                <EditVehicleDialog 
                    vehicle={editingVehicle}
                    customers={customers || []}
                    isOpen={!!editingVehicle}
                    onClose={() => setEditingVehicle(null)}
                />
            )}

            <AlertDialog open={!!vehicleToDelete} onOpenChange={(open) => !open && setVehicleToDelete(null)}>
                <AlertDialogContent className="rounded-3xl border-border/50">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Decommission Asset?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                            You are about to permanently remove <span className="font-bold text-foreground">{(vehicleToDelete as any)?.make} {(vehicleToDelete as any)?.model} ({(vehicleToDelete as any)?.numberPlate})</span> from the active fleet registry. This operation cannot be reversed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest text-[10px] h-11">Purge Asset</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
