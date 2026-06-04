'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Customer } from '@/types/customer';
import { StaffMember } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Users, 
    UserCheck, 
    TrendingUp, 
    ShieldCheck, 
    Search, 
    Filter, 
    Fingerprint,
    Mail,
    Phone,
    MoreHorizontal,
    LayoutGrid,
    List,
    Trash2,
    Edit,
    Eye,
    ShieldAlert
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PageHeader from '@/components/layout/page-header';
import { NewCustomerDialog } from '@/components/customers/new-customer-dialog';
import { EditCustomerDialog } from '@/components/customers/edit-customer-dialog';
import { CustomerCard } from '@/components/customers/customer-card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/loading-state';
import { deactivateCustomer } from '@/services/customers-service';
import { useAuth } from '@/contexts/auth-context';
import { FormattedDate } from '@/components/shared/formatted-date';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

export default function CustomersPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Role check: Only authorized staff can browse the registry
  const isAuthorized = useMemo(() => {
    if (!currentUser) return false;
    return ['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Accountant'].includes(currentUser.role);
  }, [currentUser]);

  const customersQuery = useMemoFirebase(() => {
    if (!isAuthorized || !db) return null;
    return query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
  }, [db, isAuthorized]);

  const usersQuery = useMemoFirebase(() => {
    if (!isAuthorized || !db) return null;
    return query(collection(db, 'users'));
  }, [db, isAuthorized]);

  const { data: customers, loading: collectionLoading } = useCollection<Customer>(customersQuery as any);
  const { data: users, loading: usersLoading } = useCollection<StaffMember>(usersQuery as any);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(isMobile ? 'grid' : 'table');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const stats = useMemo(() => {
    if (!customers) return { total: 0, active: 0, recent: 0, fidelity: 98.2 };
    const total = customers.length;
    const active = customers.filter(c => c.status === 'Active').length;
    
    const getToDate = (val: any) => {
        if (!val) return new Date();
        if (typeof val.toDate === 'function') return val.toDate();
        if (val.seconds) return new Date(val.seconds * 1000);
        return new Date(val);
    };

    const recent = customers.filter(c => {
        const enrollmentDate = getToDate(c.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return enrollmentDate > thirtyDaysAgo;
    }).length;

    return { total, active, recent, fidelity: 98.2 };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter(c => {
      const matchesSearch = 
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Handle Page Resets on Filter Changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const handleDelete = () => {
    if (customerToDelete && currentUser) {
        deactivateCustomer(customerToDelete.customerId, currentUser.userId);
        toast({ title: "Account Deactivated", description: `${customerToDelete.fullName} record has been closed.` });
        setCustomerToDelete(null);
    }
  };

  if (authLoading || (isAuthorized && (collectionLoading || usersLoading))) return <LoadingState />;

  if (!isAuthorized) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Access Restricted</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                    Personnel registry access is limited to authorized workshop staff. Contact your System Owner for clearance.
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
      <PageHeader title="Customer Registry">
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
          <Button onClick={() => setIsNewDialogOpen(true)} className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Register Client
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-gradient-blue border-none text-white overflow-hidden relative shadow-lg shadow-blue-500/20 group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Clients</CardTitle>
            <Users className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:scale-110" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight'>{stats.total}</p>
            <p className='text-[9px] font-bold uppercase mt-1 opacity-70'>Registered Database</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active Accounts</CardTitle>
            <UserCheck className="h-3.5 w-3.5 text-green-500 opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight text-green-600'>{stats.active}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Verified for Service</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Monthly Growth</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-indigo-500 opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight text-indigo-600'>+{stats.recent}</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Recent Enrollments</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Fidelity Rating</CardTitle>
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500 opacity-50" />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-black tracking-tight text-amber-600'>{stats.fidelity}%</p>
            <p className='text-[9px] font-bold text-muted-foreground uppercase mt-1'>Retention Index</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by client name, email, or Account ID..." 
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
                <SelectItem value="All">All Accounts</SelectItem>
                <SelectItem value="Active">Active Duty</SelectItem>
                <SelectItem value="Inactive">Closed Record</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> Registry Load
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground/60">{filteredCustomers.length} Records found</span>
          </div>

          {viewMode === 'table' && !isMobile ? (
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
              <Table>
                  <TableHeader>
                      <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em]">
                          <TableHead className="w-[300px]">Client Identity & Reference</TableHead>
                          <TableHead>Account Reach</TableHead>
                          <TableHead>Registry Status</TableHead>
                          <TableHead>Enrollment Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {paginatedCustomers.map((customer) => {
                          const userProfile = users?.find(u => u.userId === customer.customerId);
                          return (
                          <TableRow 
                              key={customer.customerId} 
                              className="cursor-pointer hover:bg-muted/30 transition-all group"
                              onClick={() => router.push(`/customers/${customer.customerId}`)}
                          >
                              <TableCell>
                                  <div className="flex items-center gap-4">
                                      <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/5 shadow-sm">
                                          <AvatarImage src={userProfile?.photoUrl} />
                                          <AvatarFallback className="font-black text-[10px] bg-primary/5 text-primary">
                                              {customer.fullName.split(' ').map(n => n[0]).join('')}
                                          </AvatarFallback>
                                      </Avatar>
                                      <div className="space-y-0.5">
                                          <p className="text-sm font-black group-hover:text-primary transition-colors uppercase tracking-tight leading-none">
                                              {customer.fullName}
                                          </p>
                                          <div className="flex items-center gap-1.5 pt-1">
                                              <Fingerprint className="h-3 w-3 text-muted-foreground/40" />
                                              <span className="text-[9px] font-mono text-muted-foreground font-bold uppercase tracking-tighter">
                                                  {customer.customerId.toUpperCase()}
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                              </TableCell>
                              <TableCell>
                                  <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/80">
                                          <Mail className="h-3 w-3 text-primary/50" /> {customer.email || 'NO_DIGITAL_ADDRESS'}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase">
                                          <Phone className="h-3 w-3 text-primary/50" /> {customer.phone}
                                      </div>
                                  </div>
                              </TableCell>
                              <TableCell>
                                  <Badge variant={customer.status === 'Active' ? 'success' : 'destructive'} className="text-[9px] font-black uppercase tracking-widest px-2.5 shadow-sm">
                                      {customer.status === 'Active' ? 'Verified Active' : 'Deactivated'}
                                  </Badge>
                              </TableCell>
                              <TableCell>
                                  <div className="space-y-0.5">
                                      <p className="text-[11px] font-black text-foreground">
                                          <FormattedDate date={customer.createdAt} formatString="dd MMM yyyy" />
                                      </p>
                                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Entry Date</p>
                                  </div>
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                                              <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-48">
                                          <DropdownMenuItem onClick={() => router.push(`/customers/${customer.customerId}`)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                              <Eye className="h-3.5 w-3.5" /> Inspect Dossier
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => setEditingCustomer(customer)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                              <Edit className="h-3.5 w-3.5" /> Update Record
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem 
                                            onClick={() => setCustomerToDelete(customer)} 
                                            className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive"
                                          >
                                              <Trash2 className="h-3.5 w-3.5" /> Deactivate Account
                                          </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </TableCell>
                          </TableRow>
                      )})}
                  </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCustomers.map(customer => {
                    const userProfile = users?.find(u => u.userId === customer.customerId);
                    return (
                        <CustomerCard 
                            key={customer.customerId} 
                            customer={customer}
                            photoUrl={userProfile?.photoUrl}
                            onView={() => router.push(`/customers/${customer.customerId}`)}
                            onEdit={() => setEditingCustomer(customer)}
                            onDelete={() => setCustomerToDelete(customer)}
                        />
                    )
                })}
            </div>
          )}

          <DataTablePagination 
              totalItems={filteredCustomers.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
      </div>

      {filteredCustomers.length === 0 && (
          <div className="py-32 text-center border-2 border-dashed rounded-[2.5rem] opacity-30 bg-muted/5">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p className="text-sm font-medium italic">No client records found matching your registry query.</p>
          </div>
      )}

      <NewCustomerDialog 
        isOpen={isNewDialogOpen} 
        onClose={() => setIsNewDialogOpen(false)} 
      />
      {editingCustomer && (
        <EditCustomerDialog
          customer={editingCustomer}
          open={!!editingCustomer}
          onOpenChange={() => setEditingCustomer(null)}
        />
      )}

      <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
          <AlertDialogContent className="rounded-3xl border-border/50">
              <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Deactivate Client Record?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                      This action will mark the account for <span className="font-bold text-foreground">{(customerToDelete as any)?.fullName}</span> as Inactive. All historical data will be preserved for auditing.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest text-[10px] h-11">Confirm Deactivation</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
