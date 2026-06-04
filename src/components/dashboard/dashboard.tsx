'use client';

import React, { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  orderBy,
  where,
  type CollectionReference,
  type Query,
} from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { useAuth } from '@/contexts/auth-context';
import { isToday, startOfMonth, format, subMonths } from 'date-fns';

import { StatsCard } from './stats-card';
import { RevenueChart } from './revenue-chart';
import { RecentBookings } from './recent-bookings';
import { RecentJobCards } from './recent-job-cards';
import { LowStockAlerts } from './low-stock-alerts';
import { PendingFollowUps } from './pending-follow-ups';
import { QuickShortcuts } from './quick-shortcuts';
import { LoadingState } from '@/components/shared/loading-state';
import { CurrencyFormat } from '@/components/shared/currency-format';

import {
  Banknote,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Package,
  History,
  ClipboardList,
  Users,
  Car,
  Wrench,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  BellPlus
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { Booking } from '@/types/booking';
import { JobCard } from '@/types/job-card';
import { InventoryItem } from '@/types/inventory';
import { Invoice } from '@/types/invoice';
import { Payment } from '@/types/payment';
import { StaffMember } from '@/types/staff';
import { CommunicationLog } from '@/types/communication';

const typedCollection = <T,>(
  db: ReturnType<typeof useFirestore>,
  path: string
): CollectionReference<T> => {
  return collection(db!, path) as CollectionReference<T>;
};

const toSafeDate = (value: unknown): Date => {
  if (!value) return new Date(0);

  if (value instanceof Date) return value;

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return new Date(value as string | number);
};

export const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const db = useFirestore();

  // Capability Gatekeepers based on Security Rules
  const role = currentUser?.role;
  const isCustomer = role === 'Customer';
  const isManagement =
    !!role && ['Makros System Owner', 'Workshop Manager'].includes(role);
  const isAccounting = role === 'Accountant' || isManagement;
  const isOps =
    !!role &&
    ['Receptionist', 'Workshop Manager', 'Makros System Owner'].includes(role);
  const isTechnical = role === 'Mechanic';
  const isLogistics =
    !!role &&
    ['Inventory Officer', 'Workshop Manager', 'Makros System Owner'].includes(
      role
    );

  // Redirect customers away from staff dashboard
  useEffect(() => {
    if (!authLoading && isCustomer) {
      router.push('/customer-portal');
    }
  }, [isCustomer, authLoading, router]);

  // Data Queries - Strictly gated by role to prevent permission errors
  const customersQuery = useMemo<Query<Customer> | null>(() => {
    if (!db || isCustomer || (!isOps && !isAccounting)) return null;
    return query(typedCollection<Customer>(db, 'customers'));
  }, [db, isCustomer, isOps, isAccounting]);

  const vehiclesQuery = useMemo<Query<Vehicle> | null>(() => {
    if (!db || isCustomer) return null;
    return query(typedCollection<Vehicle>(db, 'vehicles'));
  }, [db, isCustomer]);

  const bookingsQuery = useMemo<Query<Booking> | null>(() => {
    if (!db || isCustomer) return null;
    return query(typedCollection<Booking>(db, 'bookings'));
  }, [db, isCustomer]);

  const jobCardsQuery = useMemo<Query<JobCard> | null>(() => {
    if (!db || isCustomer) return null;
    return query(
      typedCollection<JobCard>(db, 'jobCards'),
      orderBy('createdAt', 'desc')
    );
  }, [db, isCustomer]);

  const inventoryQuery = useMemo<Query<InventoryItem> | null>(() => {
    if (!db || isCustomer) return null;
    return query(typedCollection<InventoryItem>(db, 'inventory'));
  }, [db, isCustomer]);

  const invoicesQuery = useMemo<Query<Invoice> | null>(() => {
    if (!db || isCustomer || (!isAccounting && !isOps)) return null;
    return query(typedCollection<Invoice>(db, 'invoices'));
  }, [db, isCustomer, isAccounting, isOps]);

  const paymentsQuery = useMemo<Query<Payment> | null>(() => {
    if (!db || isCustomer || !isAccounting) return null;
    return query(
      typedCollection<Payment>(db, 'payments'),
      orderBy('paidAt', 'desc')
    );
  }, [db, isCustomer, isAccounting]);

  const usersQuery = useMemo<Query<StaffMember> | null>(() => {
    if (!db || isCustomer) return null;
    return query(typedCollection<StaffMember>(db, 'users'));
  }, [db, isCustomer]);

  const commLogsQuery = useMemo<Query<CommunicationLog> | null>(() => {
    if (!db || isCustomer || !isOps) return null;
    return query(
        typedCollection<CommunicationLog>(db, 'communicationLogs'),
        orderBy('createdAt', 'desc')
    );
  }, [db, isCustomer, isOps]);

  const { data: customers, loading: custLoading } =
    useCollection<Customer>(customersQuery);
  const { data: vehicles, loading: vehLoading } =
    useCollection<Vehicle>(vehiclesQuery);
  const { data: bookings, loading: bookLoading } =
    useCollection<Booking>(bookingsQuery);
  const { data: jobCards, loading: jcLoading } =
    useCollection<JobCard>(jobCardsQuery);
  const { data: inventory, loading: invLoading } =
    useCollection<InventoryItem>(inventoryQuery);
  const { data: invoices, loading: invcLoading } =
    useCollection<Invoice>(invoicesQuery);
  const { data: payments, loading: payLoading } =
    useCollection<Payment>(paymentsQuery);
  const { data: users, loading: userLoading } =
    useCollection<StaffMember>(usersQuery);
  const { data: commLogs, loading: logsLoading } =
    useCollection<CommunicationLog>(commLogsQuery);

  const isDataLoading =
    authLoading ||
    (!!customersQuery && custLoading) ||
    (!!vehiclesQuery && vehLoading) ||
    (!!bookingsQuery && bookLoading) ||
    (!!jobCardsQuery && jcLoading) ||
    (!!inventoryQuery && invLoading) ||
    (!!invoicesQuery && invcLoading) ||
    (!!paymentsQuery && payLoading) ||
    (!!usersQuery && userLoading) ||
    (!!commLogsQuery && logsLoading);

  // Derived Stats
  const metrics = useMemo(() => {
    if (!jobCards || !bookings || !inventory || !currentUser || isCustomer) {
      return null;
    }

    const today = new Date();

    const totalCustomers = customers?.length || 0;

    const receivedToday = jobCards.filter((jc) => {
      const receivedAt = toSafeDate(jc.receivedAt);
      return isToday(receivedAt);
    }).length;

    const activeJobCards = jobCards.filter(
      (jc) =>
        !['Completed', 'Cancelled', 'Delivered', 'Paid'].includes(jc.status)
    ).length;

    const completedJobs = jobCards.filter(
      (jc) => jc.status === 'Completed'
    ).length;

    const pendingApprovals = bookings.filter(
      (b) => b.status === 'Pending'
    ).length;

    const waitingForParts = jobCards.filter(
      (jc) => jc.status === 'Waiting for Parts'
    ).length;

    const pendingInvoices =
      invoices?.filter((i) =>
        ['Unpaid', 'Partially Paid'].includes(i.paymentStatus)
      ).length || 0;

    const revenueToday =
      payments
        ?.filter((p) => {
          const paidAt = toSafeDate(p.paidAt);
          return isToday(paidAt);
        })
        .reduce((sum, p) => sum + p.amount, 0) || 0;

    const lowStockItems = inventory.filter(
      (item) => item.quantity <= item.reorderLevel
    );

    const availableMechanics =
      users?.filter(
        (u) => u.role === 'Mechanic' && (u.currentWorkload || 0) < 3
      ).length || 0;

    const chartData =
      isAccounting && payments
        ? Array.from({ length: 6 }).map((_, i) => {
            const monthDate = subMonths(startOfMonth(today), 5 - i);
            const monthLabel = format(monthDate, 'MMM');

            const monthRevenue = payments
              .filter((p) => {
                const paidAt = toSafeDate(p.paidAt);
                return (
                  format(paidAt, 'MMM yyyy') ===
                  format(monthDate, 'MMM yyyy')
                );
              })
              .reduce((sum, p) => sum + p.amount, 0);

            return {
              name: monthLabel,
              revenue: monthRevenue,
            };
          })
        : [];

    const pendingFollowUps = commLogs?.filter(l => 
        l.requiresFollowUp && 
        l.status !== 'Resolved' && 
        l.status !== 'Closed'
    ).length || 0;

    return {
      totalCustomers,
      receivedToday,
      activeJobCards,
      completedJobs,
      pendingApprovals,
      waitingForParts,
      pendingInvoices,
      revenueToday,
      lowStockCount: lowStockItems.length,
      availableMechanics,
      chartData,
      pendingFollowUps
    };
  }, [
    customers,
    jobCards,
    bookings,
    inventory,
    invoices,
    payments,
    users,
    commLogs,
    currentUser,
    isCustomer,
    isAccounting,
  ]);

  if (isDataLoading) return <LoadingState />;
  if (isCustomer) return null;
  if (!metrics || !currentUser) return null;

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
              <LayoutGrid className="text-primary w-5 h-5" />
            </div>

            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase font-headline">
                Workshop Command
              </h2>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">
                Real-time Operational Intelligence • {currentUser.role}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted/30 border border-border/50">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Registry Sync Active
            </span>
          </div>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAccounting && (
          <StatsCard
            title="Gross Revenue (Today)"
            value={<CurrencyFormat value={metrics.revenueToday} abbreviate />}
            subtitle="Verified Collections"
            icon={<Banknote className="h-5 w-5" />}
            gradient="blue"
          />
        )}

        {isOps && (
          <StatsCard
            title="Bay Intakes Today"
            value={metrics.receivedToday.toString()}
            subtitle={`${metrics.pendingApprovals} Pending Approvals`}
            icon={<Car className="h-5 w-5" />}
            gradient="purple"
          />
        )}

        {isTechnical && (
          <StatsCard
            title="Your Active Jobs"
            value={(
              jobCards?.filter(
                (jc) =>
                  jc.assignedMechanicId === currentUser.userId &&
                  jc.status !== 'Completed'
              ).length || 0
            ).toString()}
            subtitle="In-Bay Operations"
            icon={<Wrench className="h-5 w-5" />}
            gradient="orange"
          />
        )}

        {isLogistics && (
          <StatsCard
            title="Supply Watch"
            value={metrics.lowStockCount.toString()}
            subtitle="SKUs Needing Attention"
            icon={<Package className="h-5 w-5" />}
            gradient={metrics.lowStockCount > 0 ? 'orange' : 'green'}
          />
        )}

        {isManagement && (
          <StatsCard
            title="Workforce Ready"
            value={metrics.availableMechanics.toString()}
            subtitle="Low-Load Technicians"
            icon={<Users className="h-5 w-5" />}
            gradient="green"
          />
        )}
      </div>

      {/* Action Terminals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" />
            Registry Rapid Access
          </h3>
        </div>

        <QuickShortcuts />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isAccounting ? (
            <RevenueChart data={metrics.chartData} />
          ) : (
            <Card className="h-full bg-card border-border/50 rounded-3xl overflow-hidden flex flex-col justify-center items-center p-12 text-center opacity-40">
              <ShieldCheck className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-black uppercase tracking-widest">
                Financial Clearance Required
              </h3>
              <p className="text-sm font-medium italic">
                Revenue trends are restricted to fiscal personnel.
              </p>
            </Card>
          )}
        </div>

        <Card className="bg-slate-900 shadow-2xl border-none flex flex-col justify-between hover:scale-[1.01] transition-all duration-500 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 transition-transform group-hover:rotate-45 duration-700">
            <Sparkles className="w-48 h-48 text-white" />
          </div>

          <CardHeader className="relative z-10 p-8">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>

            <CardTitle className="text-white font-black uppercase tracking-tight text-2xl">
              AI Diagnostic Intelligence
            </CardTitle>

            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              v2.4.0 Engine Active
            </p>
          </CardHeader>

          <CardContent className="space-y-8 relative z-10 p-8 pt-0">
            <p className="text-white/70 leading-relaxed font-medium text-sm">
              Process vehicle telemetry and reported symptoms to generate
              immediate technical roadmaps and stock requirements.
            </p>

            <Button
              onClick={() => router.push('/job-cards/new')}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-3 font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-2xl shadow-xl shadow-primary/20 border-none transition-all hover:translate-y-[-2px]"
            >
              Initialize Intake Dossier
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <Card className="bg-card border-border/50 rounded-3xl overflow-hidden premium-shadow">
          <CardHeader className="bg-muted/30 px-6 py-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-3.5 w-3.5" />
              Recent Queue
            </CardTitle>

            <span className="text-[10px] font-bold text-muted-foreground/40">
              {bookings?.length || 0} Scheduled
            </span>
          </CardHeader>

          <CardContent className="p-0">
            <RecentBookings bookings={bookings?.slice(0, 5) || []} />
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-3xl overflow-hidden premium-shadow">
          <CardHeader className="bg-muted/30 px-6 py-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <History className="h-3.5 w-3.5" />
              Bay Activities
            </CardTitle>

            <span className="text-[10px] font-bold text-muted-foreground/40">
              {metrics.activeJobCards} Active Traces
            </span>
          </CardHeader>

          <CardContent className="p-0">
            <RecentJobCards
              jobCards={
                currentUser.role === 'Mechanic'
                  ? jobCards
                      ?.filter(
                        (jc) => jc.assignedMechanicId === currentUser.userId
                      )
                      .slice(0, 5) || []
                  : jobCards?.slice(0, 5) || []
              }
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-3xl overflow-hidden premium-shadow">
          <CardHeader className="bg-muted/30 px-6 py-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <BellPlus className="h-3.5 w-3.5 text-primary" />
              Follow-Ups
            </CardTitle>

            <span className="text-[10px] font-bold text-muted-foreground/40">
              {metrics.pendingFollowUps} Actionable
            </span>
          </CardHeader>

          <CardContent className="p-0">
            <PendingFollowUps 
                logs={commLogs?.filter(l => l.requiresFollowUp && l.status !== 'Resolved' && l.status !== 'Closed').slice(0, 5) || []} 
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-3xl overflow-hidden premium-shadow">
          <CardHeader className="bg-muted/30 px-6 py-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
              Supply Watch
            </CardTitle>

            <span className="text-[10px] font-bold text-muted-foreground/40">
              Critical Void
            </span>
          </CardHeader>

          <CardContent className="p-0">
            <LowStockAlerts
              items={
                inventory
                  ?.filter((i) => i.quantity <= i.reorderLevel)
                  .slice(0, 5) || []
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center rounded-[2.5rem]">
        <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.5em]">
          Makros System Professional Workshop OS • Certified Command Center
        </p>
      </div>
    </div>
  );
};
