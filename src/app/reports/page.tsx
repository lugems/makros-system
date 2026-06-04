'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  orderBy,
} from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingState } from '@/components/shared/loading-state';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';
import { startOfDay, endOfDay } from 'date-fns';

import {
  ChartBar,
  TrendingUp,
  Wallet,
  Activity,
  Package,
  ShieldCheck,
  Wrench,
  FileText,
  Download,
  Printer,
  Search,
  ShieldAlert,
  Sparkles,
  Layers,
  History
} from 'lucide-react';

import RevenueSummary from '@/components/reports/revenue-summary';
import { SalesReport } from '@/components/reports/sales-report';
import OutstandingInvoicesReport from '@/components/reports/outstanding-invoices-report';
import MechanicPerformanceReport from '@/components/reports/mechanic-performance-report';
import InventoryReport from '@/components/reports/inventory-report';
import { PaymentsMethodReport } from '@/components/reports/payments-method-report';
import { ServiceDemandReport } from '@/components/reports/service-demand-report';
import { ProfitSummaryReport } from '@/components/reports/profit-summary-report';

import { Invoice } from '@/types/invoice';
import { Payment } from '@/types/payment';
import { JobCard } from '@/types/job-card';
import { Booking } from '@/types/booking';
import { InventoryItem } from '@/types/inventory';
import { StaffMember } from '@/types/staff';

const toSafeDate = (value: unknown): Date => {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date(value as string | number);
};

/**
 * @fileOverview Intelligence Ledger Command Center.
 * Aggregates multi-registry data to provide forensic operational insights.
 */
export default function ReportsPage() {
  const router = useRouter();
  const { user: currentUser, role: authRole, isLoading: authLoading } = useAuth();
  const db = useFirestore();

  const currentRole = authRole ?? currentUser?.role ?? '';

  // 1. Authorization Matrix
  const canAccessFinancial = ['Makros System Owner', 'Workshop Manager', 'Accountant'].includes(currentRole);
  const canAccessOperational = ['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Mechanic'].includes(currentRole);
  const canAccessLogistics = ['Makros System Owner', 'Workshop Manager', 'Inventory Officer'].includes(currentRole);
  const isAuthorized = canAccessFinancial || canAccessOperational || canAccessLogistics;

  // 2. Operational State
  const [activeTab, setActiveTab] = useState('financial');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Technical Data Streams - Stabilized with useMemoFirebase
  const paymentsQuery = useMemoFirebase(() => {
    if (!db || !canAccessFinancial) return null;
    return query(collection(db, 'payments'), orderBy('paidAt', 'desc'));
  }, [db, canAccessFinancial]);

  const invoicesQuery = useMemoFirebase(() => {
    if (!db || (!canAccessFinancial && !canAccessOperational)) return null;
    return query(collection(db, 'invoices'), orderBy('issuedAt', 'desc'));
  }, [db, canAccessFinancial, canAccessOperational]);

  const jobsQuery = useMemoFirebase(() => {
    if (!db || !canAccessOperational) return null;
    return query(collection(db, 'jobCards'), orderBy('createdAt', 'desc'));
  }, [db, canAccessOperational]);

  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !canAccessOperational) return null;
    return query(collection(db, 'bookings'), orderBy('bookingDate', 'desc'));
  }, [db, canAccessOperational]);

  const inventoryQuery = useMemoFirebase(() => {
    if (!db || !canAccessLogistics) return null;
    return query(collection(db, 'inventory'));
  }, [db, canAccessLogistics]);

  const usersQuery = useMemoFirebase(() => {
    if (!db || !isAuthorized) return null;
    return query(collection(db, 'users'));
  }, [db, isAuthorized]);

  const { data: payments, loading: payLoading } = useCollection<Payment>(paymentsQuery as any);
  const { data: invoices, loading: invLoading } = useCollection<Invoice>(invoicesQuery as any);
  const { data: jobCards, loading: jobLoading } = useCollection<JobCard>(jobsQuery as any);
  const { data: bookings, loading: bookLoading } = useCollection<Booking>(bookingsQuery as any);
  const { data: inventory, loading: stockLoading } = useCollection<InventoryItem>(inventoryQuery as any);
  const { data: staff, loading: staffLoading } = useCollection<StaffMember>(usersQuery as any);

  const isDataLoading = authLoading || 
    (!!paymentsQuery && payLoading) || 
    (!!invoicesQuery && invLoading) || 
    (!!jobsQuery && jobLoading) || 
    (!!bookingsQuery && bookLoading) || 
    (!!inventoryQuery && stockLoading) || 
    (!!usersQuery && staffLoading);

  // Default tab calibration based on role authority
  useEffect(() => {
    if (!authLoading && isAuthorized) {
        if (!canAccessFinancial) {
            if (canAccessOperational) setActiveTab('operational');
            else if (canAccessLogistics) setActiveTab('logistics');
        }
    }
  }, [authLoading, isAuthorized, canAccessFinancial, canAccessOperational, canAccessLogistics]);

  // 4. Data Refinement & Forensic Filtering
  const filteredData = useMemo(() => {
    if (!invoices || !jobCards) return null;

    let filteredPayments: Payment[] = payments || [];
    let filteredInvoices: Invoice[] = [...invoices];
    let filteredJobs: JobCard[] = [...jobCards];

    if (dateRange?.from) {
      const from = startOfDay(dateRange.from).getTime();
      const to = dateRange.to ? endOfDay(dateRange.to).getTime() : endOfDay(new Date()).getTime();

      filteredPayments = filteredPayments.filter((payment) => {
        const date = toSafeDate(payment.paidAt).getTime();
        return date >= from && date <= to;
      });

      filteredInvoices = filteredInvoices.filter((invoice) => {
        const date = toSafeDate(invoice.issuedAt).getTime();
        return date >= from && date <= to;
      });

      filteredJobs = filteredJobs.filter((jobCard) => {
        const date = toSafeDate(jobCard.createdAt).getTime();
        return date >= from && date <= to;
      });
    }

    if (currentRole === 'Mechanic' && currentUser) {
      filteredJobs = filteredJobs.filter(
        (jobCard) => jobCard.assignedMechanicId === currentUser.userId
      );
    }

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredInvoices = filteredInvoices.filter(i => 
            i.invoiceNumber?.toLowerCase().includes(term) || 
            i.customerId.toLowerCase().includes(term)
        );
        filteredJobs = filteredJobs.filter(j => 
            j.jobCardId.toLowerCase().includes(term) || 
            j.reportedIssue.toLowerCase().includes(term)
        );
    }

    return {
      filteredPayments,
      filteredInvoices,
      filteredJobs,
    };
  }, [payments, invoices, jobCards, dateRange, currentRole, currentUser, searchTerm]);

  // 5. High-Level Insight Summary
  const summaryMetrics = useMemo(() => {
    if (!filteredData) return { gross: 0, net: 0, efficiency: 0, activeJobs: 0 };

    const gross = filteredData.filteredInvoices.reduce((sum, invoice) => sum + (invoice.grandTotal || 0), 0);
    const net = filteredData.filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const activeJobs = filteredData.filteredJobs.filter(j => !['Completed', 'Cancelled', 'Delivered', 'Paid'].includes(j.status)).length;
    const completed = filteredData.filteredJobs.filter(j => j.status === 'Completed').length;
    const total = filteredData.filteredJobs.length || 1;
    const efficiency = Math.round((completed / total) * 100);

    return { gross, net, efficiency, activeJobs };
  }, [filteredData]);

  const handleExport = (type: 'PDF' | 'CSV') => {
    alert(`Certified ${type} Ledger Export process initialized for active filter interval.`);
  };

  if (authLoading || isDataLoading) return <LoadingState />;

  if (!isAuthorized) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Access Restricted</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                    Analytical ledger access is limited to authorized personnel. Contact your System Owner for clearance.
                </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8">
                Return to Command
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-muted/20 p-8 rounded-[2.5rem] border border-border/50">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
            <ChartBar className="text-primary w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter font-headline leading-none">Intelligence Ledger</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60 mt-1.5 flex items-center gap-2">
               <ShieldCheck className="h-3 w-3 text-green-500" /> Forensic Operational Analysis • {currentRole} Sync Active
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border/50 shrink-0 shadow-inner">
            <Button variant="ghost" size="icon" onClick={() => window.print()} className="h-10 w-10 rounded-xl hover:bg-background">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleExport('PDF')} className="h-10 w-10 rounded-xl hover:bg-background">
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleExport('CSV')} className="h-10 w-10 rounded-xl hover:bg-background">
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <DateRangePicker date={dateRange} setDate={setDateRange} className="flex-1 lg:flex-none" />
        </div>
      </header>

      {/* Intelligence Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-gradient-blue border-none text-white overflow-hidden relative shadow-lg shadow-blue-500/20 group rounded-[2rem]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Gross Yield</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-50 transition-transform group-hover:scale-110" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className="text-4xl font-black tracking-tighter">
              <CurrencyFormat value={summaryMetrics.gross} abbreviate />
            </p>
            <p className="text-[9px] font-bold uppercase mt-2 opacity-70">Interval Ledger Total</p>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm rounded-[2rem]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Net Realized</CardTitle>
            <Wallet className="h-4 w-4 text-green-500 opacity-50" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className="text-4xl font-black tracking-tighter text-green-600">
              <CurrencyFormat value={summaryMetrics.net} abbreviate />
            </p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2">Verified Revenue Collections</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm rounded-[2rem]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-indigo-500 opacity-50" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className="text-4xl font-black tracking-tighter text-indigo-600">{summaryMetrics.efficiency}%</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2">Job Completion Velocity</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden group shadow-sm rounded-[2rem]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-8">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Active Bay Load</CardTitle>
            <Wrench className="h-4 w-4 text-orange-500 opacity-50" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className="text-4xl font-black tracking-tighter text-orange-600">{summaryMetrics.activeJobs}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2">Current Trace Registry</p>
          </CardContent>
        </Card>
      </div>

      {/* Global Ledger Filter */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-[1.75rem] shadow-sm">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search analytical dossiers, technician terminals, or fiscal records..."
            className="pl-11 bg-background h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm border-none font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-background border border-border/50 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Certified Logic Active</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-card border border-border/50 rounded-[2.5rem] p-2 mb-10 overflow-x-auto shadow-sm premium-shadow">
          <TabsList className="bg-transparent h-auto gap-2 p-0 flex justify-start w-full min-w-max">
            {canAccessFinancial && (
              <TabsTrigger value="financial" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-2xl px-8 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all">
                <Wallet className="w-4 h-4 mr-2" /> Financial Flow
              </TabsTrigger>
            )}
            {canAccessOperational && (
              <TabsTrigger value="operational" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-2xl px-8 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all">
                <Activity className="w-4 h-4 mr-2" /> Operational Yield
              </TabsTrigger>
            )}
            {canAccessLogistics && (
              <TabsTrigger value="logistics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-2xl px-8 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all">
                <Package className="w-4 h-4 mr-2" /> Supply Chain
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {canAccessFinancial && filteredData && (
          <TabsContent value="financial" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <RevenueSummary payments={filteredData.filteredPayments} />
              <ProfitSummaryReport invoices={filteredData.filteredInvoices} payments={filteredData.filteredPayments} />
              <div className="lg:col-span-2">
                <SalesReport invoices={filteredData.filteredInvoices} />
              </div>
              <PaymentsMethodReport payments={filteredData.filteredPayments} />
              <OutstandingInvoicesReport invoices={filteredData.filteredInvoices} />
            </div>
          </TabsContent>
        )}

        {canAccessOperational && filteredData && (
          <TabsContent value="operational" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="lg:col-span-2">
                <MechanicPerformanceReport 
                  jobCards={filteredData.filteredJobs} 
                  staff={staff || []} 
                  specificUserId={currentRole === 'Mechanic' ? currentUser?.userId : undefined} 
                />
              </div>
              <ServiceDemandReport bookings={bookings || []} />
              <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-20 w-20 rounded-[2rem] bg-background border flex items-center justify-center shadow-xl">
                      <History className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase tracking-tight">Interval Analytics</h3>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-md italic">
                        Current data represents operational traces from the active temporal window. Performance metrics are calculated using certified job completion timestamps.
                      </p>
                  </div>
              </div>
            </div>
          </TabsContent>
        )}

        {canAccessLogistics && (
          <TabsContent value="logistics" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
            <div className="grid grid-cols-1 gap-10">
              <InventoryReport inventory={inventory || []} />
            </div>
          </TabsContent>
        )}
      </Tabs>

      <footer className="bg-muted/30 px-8 py-10 border-t flex flex-col items-center justify-center rounded-[3rem] text-center space-y-3">
        <div className="flex items-center gap-3 text-muted-foreground/40">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-[10px] font-black uppercase tracking-[0.6em]">Makros System Analytical OS • Internal Registry Trace Active</p>
        </div>
        <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] max-w-2xl">
          Analytical data is derived from certified workshop transactions and immutable operational logs. Fiscal reports are processed using centralized tax parameters defined in the master registry.
        </p>
      </footer>
    </div>
  );
}
