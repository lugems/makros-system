'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CurrencyFormat } from "@/components/shared/currency-format";
import { FileText, AlertCircle, Fingerprint, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OutstandingInvoicesReportProps {
  invoices: any[];
}

const OutstandingInvoicesReport = ({ invoices }: OutstandingInvoicesReportProps) => {
  const pendingInvoices = React.useMemo(() => {
    return invoices
        .filter(inv => inv.balance > 0 && inv.paymentStatus !== 'Cancelled')
        .sort((a, b) => (b.balance || 0) - (a.balance || 0))
        .slice(0, 10);
  }, [invoices]);

  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);
  const overdueCount = invoices.filter(inv => inv.paymentStatus === 'Overdue').length;

  return (
    <Card className="rounded-2xl sm:rounded-[2rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow h-full">
      <CardHeader className="bg-muted/30 border-b p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" /> Debt Ledger
          </CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">High-Impact Outstanding Balances</p>
        </div>
        <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
                <p className="text-xl sm:text-2xl font-black text-orange-600 tracking-tighter"><CurrencyFormat value={totalOutstanding} abbreviate /></p>
                <p className="text-[8px] sm:text-[9px] font-black uppercase text-muted-foreground tracking-widest">Total At Risk</p>
            </div>
            <div className="bg-orange-500/10 p-2.5 sm:p-3 rounded-2xl border border-orange-500/20 text-center min-w-[70px] sm:min-w-[80px]">
                <p className="text-lg sm:text-xl font-black text-orange-700 leading-none">{overdueCount}</p>
                <p className="text-[8px] font-bold text-orange-600 uppercase mt-1">Critical</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile Card List View */}
        <div className="block sm:hidden divide-y divide-border/50">
            {pendingInvoices.map((invoice) => (
                <div key={invoice.invoiceId} className="p-4 space-y-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-background border flex items-center justify-center text-muted-foreground shadow-sm shrink-0">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                    <Fingerprint className="h-3 w-3 text-primary opacity-50" />
                                    <span className="text-xs font-black uppercase">
                                        {invoice.invoiceNumber || invoice.invoiceId.slice(-8).toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase">
                                    UID: {invoice.customerId.slice(-6).toUpperCase()} • {new Date(invoice.issuedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm shrink-0",
                            invoice.paymentStatus === 'Overdue' ? "bg-red-500/10 text-red-600 border-red-200" : "bg-orange-500/5 text-orange-600 border-orange-200"
                        )}>
                            {invoice.paymentStatus}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-border/40">
                        <span className="text-[9px] font-black uppercase text-muted-foreground">Balance Due</span>
                        <p className="text-base font-black text-orange-600 tabular-nums tracking-tight">
                            <CurrencyFormat value={invoice.balance} />
                        </p>
                    </div>
                </div>
            ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 border-none uppercase text-[10px] font-black tracking-[0.2em]">
                <TableHead className="px-8 h-12">Record Identity & Timeline</TableHead>
                <TableHead className="px-8 text-right h-12">Balance Due (Ush)</TableHead>
                <TableHead className="px-8 text-right h-12">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvoices.map((invoice) => (
                <TableRow key={invoice.invoiceId} className="hover:bg-muted/30 border-border/50 group cursor-pointer transition-colors">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                          <div className="flex items-center gap-2">
                              <Fingerprint className="h-3 w-3 text-primary opacity-40" />
                              <span className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                                  {invoice.invoiceNumber || invoice.invoiceId.slice(-8).toUpperCase()}
                              </span>
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                              UID: {invoice.customerId.slice(-6).toUpperCase()} • Issued: {new Date(invoice.issuedAt).toLocaleDateString()}
                          </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 text-right">
                      <p className="text-base font-black text-orange-600 tabular-nums tracking-tighter">
                          <CurrencyFormat value={invoice.balance} />
                      </p>
                  </TableCell>
                  <TableCell className="px-8 text-right">
                      <Badge variant="outline" className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm",
                          invoice.paymentStatus === 'Overdue' ? "bg-red-500/10 text-red-600 border-red-200" : "bg-orange-500/5 text-orange-600 border-orange-200"
                      )}>
                          {invoice.paymentStatus}
                      </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pendingInvoices.length === 0 && (
            <div className="py-20 sm:py-32 text-center opacity-30 italic text-sm text-muted-foreground flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] bg-green-500/5 border border-green-500/10 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-green-500/50" />
                </div>
                <div className="space-y-1">
                    <p className="font-black uppercase tracking-[0.2em]">Dossier Clear</p>
                    <p className="text-xs">No outstanding balances detected in the active registry.</p>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OutstandingInvoicesReport;
