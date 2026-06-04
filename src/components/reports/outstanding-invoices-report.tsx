'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CurrencyFormat } from "@/components/shared/currency-format";
import { FileText, AlertCircle, Fingerprint, ShieldCheck, History } from 'lucide-react';
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
    <Card className="rounded-[2rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow h-full">
      <CardHeader className="bg-muted/30 border-b p-8 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" /> Debt Ledger
          </CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">High-Impact Outstanding Balances</p>
        </div>
        <div className="flex items-center gap-8">
            <div className="text-right">
                <p className="text-2xl font-black text-orange-600 tracking-tighter"><CurrencyFormat value={totalOutstanding} abbreviate /></p>
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Total At Risk</p>
            </div>
            <div className="bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20 text-center min-w-[80px]">
                <p className="text-xl font-black text-orange-700 leading-none">{overdueCount}</p>
                <p className="text-[8px] font-bold text-orange-600 uppercase mt-1">Critical</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
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
        {pendingInvoices.length === 0 && (
            <div className="py-32 text-center opacity-30 italic text-sm text-muted-foreground flex flex-col items-center justify-center space-y-4">
                <div className="h-20 w-20 rounded-[2rem] bg-green-500/5 border border-green-500/10 flex items-center justify-center">
                    <ShieldCheck className="h-10 w-10 text-green-500/50" />
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
