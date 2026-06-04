'use client';

import React, { useMemo, useState } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/shared/loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyFormat } from "@/components/shared/currency-format";

import {
  Activity,
  Calendar,
  ChartBar,
  Download,
  FileText,
  Package,
  Printer,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";

import RevenueSummary from "./revenue-summary";
import { SalesReport } from "./sales-report";
import OutstandingInvoicesReport from "./outstanding-invoices-report";
import MechanicPerformanceReport from "./mechanic-performance-report";
import InventoryReport from "./inventory-report";
import { PaymentsMethodReport } from "./payments-method-report";
import { ServiceDemandReport } from "./service-demand-report";
import { ProfitSummaryReport } from "./profit-summary-report";

export default function ReportsPage() {
  const { isLoading: authLoading } = useAuth();
  const db = useFirestore();

  const [activeTab, setActiveTab] = useState("financial");
  const [dateInterval, setDateInterval] = useState("all");

  const paymentsQuery = useMemo(
    () => query(collection(db, "payments"), orderBy("paidAt", "desc")),
    [db]
  );

  const invoicesQuery = useMemo(
    () => query(collection(db, "invoices"), orderBy("issuedAt", "desc")),
    [db]
  );

  const jobsQuery = useMemo(
    () => query(collection(db, "jobCards"), orderBy("createdAt", "desc")),
    [db]
  );

  const bookingsQuery = useMemo(
    () => query(collection(db, "bookings"), orderBy("bookingDate", "desc")),
    [db]
  );

  const inventoryQuery = useMemo(
    () => query(collection(db, "inventory")),
    [db]
  );

  const suppliersQuery = useMemo(
    () => query(collection(db, "suppliers")),
    [db]
  );

  const usersQuery = useMemo(
    () => query(collection(db, "users")),
    [db]
  );

  const logsQuery = useMemo(
    () => query(collection(db, "auditLogs"), orderBy("createdAt", "desc")),
    [db]
  );

  const { data: payments, loading: payLoading } = useCollection<any>(paymentsQuery);
  const { data: invoices, loading: invLoading } = useCollection<any>(invoicesQuery);
  const { data: jobCards, loading: jobLoading } = useCollection<any>(jobsQuery);
  const { data: bookings, loading: bookLoading } = useCollection<any>(bookingsQuery);
  const { data: inventory, loading: stockLoading } = useCollection<any>(inventoryQuery);
  const { loading: supLoading } = useCollection<any>(suppliersQuery);
  const { data: staff, loading: staffLoading } = useCollection<any>(usersQuery);
  const { loading: logsLoading } = useCollection<any>(logsQuery);

  const isDataLoading =
    authLoading ||
    payLoading ||
    invLoading ||
    jobLoading ||
    bookLoading ||
    stockLoading ||
    supLoading ||
    staffLoading ||
    logsLoading;

  const filteredData = useMemo(() => {
    if (!payments || !invoices || !jobCards || !bookings) return null;

    if (dateInterval === "all") {
      return {
        payments,
        invoices,
        jobCards,
        bookings,
      };
    }

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - Number(dateInterval));

    const getDate = (value: any) => {
      if (!value) return new Date(0);
      if (value?.toDate) return value.toDate();
      return new Date(value);
    };

    return {
      payments: payments.filter((payment) => getDate(payment.paidAt) >= cutoff),
      invoices: invoices.filter((invoice) => getDate(invoice.issuedAt) >= cutoff),
      jobCards: jobCards.filter((jobCard) => getDate(jobCard.createdAt) >= cutoff),
      bookings: bookings.filter((booking) => getDate(booking.bookingDate) >= cutoff),
    };
  }, [payments, invoices, jobCards, bookings, dateInterval]);

  const metrics = useMemo(() => {
    if (!filteredData || !inventory || !jobCards) {
      return {
        gross: 0,
        net: 0,
        efficiency: 0,
        shortages: 0,
        activeJobs: 0,
      };
    }

    const {
      payments: filteredPayments,
      invoices: filteredInvoices,
      jobCards: periodJobs,
    } = filteredData;

    const gross = filteredInvoices.reduce(
      (sum, invoice) => sum + (Number(invoice.grandTotal) || 0),
      0
    );

    const net = filteredPayments.reduce(
      (sum, payment) => sum + (Number(payment.amount) || 0),
      0
    );

    const shortages = inventory.filter(
      (item) => Number(item.quantity || 0) <= Number(item.reorderLevel || 0)
    ).length;

    const activeJobs = jobCards.filter(
      (jobCard) =>
        !["Completed", "Cancelled", "Delivered", "Paid"].includes(jobCard.status)
    ).length;

    const completed = periodJobs.filter(
      (jobCard) => jobCard.status === "Completed"
    ).length;

    const total = periodJobs.length || 1;
    const efficiency = Math.round((completed / total) * 100);

    return {
      gross,
      net,
      efficiency,
      shortages,
      activeJobs,
    };
  }, [filteredData, inventory, jobCards]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    console.log("Export dossier clicked");
  };

  const handleRecord = () => {
    console.log("Record clicked");
  };

  if (isDataLoading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden px-3 pb-20 pt-2 sm:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6 animate-in fade-in duration-700 md:space-y-8">
        <header className="flex w-full min-w-0 flex-col gap-5 rounded-[1.75rem] border border-border/40 bg-card/40 p-4 shadow-sm sm:rounded-[2rem] sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-sm sm:h-12 sm:w-12">
              <ChartBar className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="break-words text-2xl font-black uppercase leading-none tracking-tighter font-headline sm:text-3xl lg:text-4xl">
                Intelligence Ledger
              </h1>
              <p className="mt-2 break-words text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground opacity-70 sm:text-[10px] sm:tracking-[0.3em]">
                Full-Stack Operational Analytics Active
              </p>
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div className="flex h-11 w-full items-center justify-center rounded-2xl border border-border/50 bg-muted/30 p-1 sm:w-auto sm:justify-start">
              <button
                type="button"
                onClick={handlePrint}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                aria-label="Print report"
              >
                <Printer className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleRecord}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                aria-label="View record"
              >
                <FileText className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                aria-label="Export dossier"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>

            <div className="w-full min-w-0 sm:w-[220px] lg:w-[240px]">
              <Select value={dateInterval} onValueChange={setDateInterval}>
                <SelectTrigger className="!h-11 !min-h-11 w-full min-w-0 overflow-hidden rounded-2xl border-border/50 bg-background px-3 text-[10px] font-black uppercase tracking-widest shadow-sm">
                  <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />

                    <span className="min-w-0 flex-1 truncate text-left">
                      <SelectValue placeholder="Date Interval" />
                    </span>
                  </div>
                </SelectTrigger>

                <SelectContent
                  align="end"
                  className="max-w-[calc(100vw-2rem)] rounded-2xl border-border/50"
                >
                  <SelectItem value="7" className="text-[10px] font-bold uppercase">
                    Last 07 Cycles
                  </SelectItem>
                  <SelectItem value="30" className="text-[10px] font-bold uppercase">
                    Last 30 Cycles
                  </SelectItem>
                  <SelectItem value="90" className="text-[10px] font-bold uppercase">
                    Last 90 Cycles
                  </SelectItem>
                  <SelectItem value="all" className="text-[10px] font-bold uppercase">
                    Global Archive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          <Card className="dashboard-gradient-blue relative min-w-0 overflow-hidden border-none text-white shadow-lg shadow-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.22em] opacity-80 sm:tracking-[0.3em]">
                Gross Yield
              </CardTitle>
              <TrendingUp className="h-4 w-4 shrink-0 opacity-50" />
            </CardHeader>
            <CardContent>
              <p className="break-words text-2xl font-black tracking-tighter sm:text-3xl">
                <CurrencyFormat value={metrics.gross} abbreviate />
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase opacity-70">
                Total Authorized Billings
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden border-border/50 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground sm:tracking-[0.3em]">
                Net Realized
              </CardTitle>
              <Wallet className="h-4 w-4 shrink-0 text-green-500 opacity-50" />
            </CardHeader>
            <CardContent>
              <p className="break-words text-2xl font-black tracking-tighter text-green-600 sm:text-3xl">
                <CurrencyFormat value={metrics.net} abbreviate />
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase text-muted-foreground">
                Verified Collections
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden border-border/50 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground sm:tracking-[0.3em]">
                Efficiency
              </CardTitle>
              <Activity className="h-4 w-4 shrink-0 text-indigo-500 opacity-50" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black tracking-tighter text-indigo-600 sm:text-3xl">
                {metrics.efficiency}%
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase text-muted-foreground">
                Job Completion Velocity
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden border-border/50 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground sm:tracking-[0.3em]">
                Active Load
              </CardTitle>
              <Wrench className="h-4 w-4 shrink-0 text-orange-500 opacity-50" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black tracking-tighter text-orange-600 sm:text-3xl">
                {metrics.activeJobs}
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase text-muted-foreground">
                Operational Bay Capacity
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
          <div className="mb-6 w-full min-w-0 rounded-2xl border border-border/50 bg-card p-1.5 shadow-sm sm:mb-8 lg:mb-10">
            <div className="w-full min-w-0 overflow-x-auto">
              <TabsList className="flex h-auto w-max min-w-full justify-start gap-1 bg-transparent p-0">
                <TabsTrigger
                  value="financial"
                  className="min-h-11 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6"
                >
                  <Wallet className="mr-2 h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Financial Flow</span>
                </TabsTrigger>

                <TabsTrigger
                  value="operational"
                  className="min-h-11 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6"
                >
                  <Activity className="mr-2 h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Operational Yield</span>
                </TabsTrigger>

                <TabsTrigger
                  value="logistics"
                  className="min-h-11 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6"
                >
                  <Package className="mr-2 h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Supply Chain</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent
            value="financial"
            className="space-y-6 focus-visible:outline-none lg:space-y-10"
          >
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
              <div className="min-w-0">
                <RevenueSummary payments={filteredData?.payments || []} />
              </div>

              <div className="min-w-0">
                <SalesReport invoices={filteredData?.invoices || []} />
              </div>

              <div className="min-w-0">
                <PaymentsMethodReport payments={filteredData?.payments || []} />
              </div>

              <div className="min-w-0">
                <ProfitSummaryReport
                  invoices={filteredData?.invoices || []}
                  payments={filteredData?.payments || []}
                />
              </div>

              <div className="min-w-0 lg:col-span-2">
                <OutstandingInvoicesReport invoices={filteredData?.invoices || []} />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="operational"
            className="space-y-6 focus-visible:outline-none lg:space-y-10"
          >
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
              <div className="min-w-0">
                <MechanicPerformanceReport
                  jobCards={filteredData?.jobCards || []}
                  staff={staff || []}
                />
              </div>

              <div className="min-w-0">
                <ServiceDemandReport bookings={filteredData?.bookings || []} />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="logistics"
            className="space-y-6 focus-visible:outline-none lg:space-y-10"
          >
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:gap-10">
              <div className="min-w-0">
                <InventoryReport inventory={inventory || []} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="rounded-[1.75rem] border-t bg-muted/30 px-4 py-5 sm:rounded-[2.5rem] sm:px-8 sm:py-6">
          <div className="flex min-w-0 flex-col items-center justify-center gap-2 text-center text-muted-foreground/40 sm:flex-row">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <p className="break-words text-[8px] font-black uppercase tracking-[0.24em] sm:text-[9px] sm:tracking-[0.6em]">
              Makros System Analytical OS • Internal Registry Trace Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}