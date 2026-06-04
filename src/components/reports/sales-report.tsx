'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CurrencyFormat } from "@/components/shared/currency-format";
import { FormattedDate } from "@/components/shared/formatted-date";
import { Banknote, Wallet, TrendingUp, History, Fingerprint, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import { Invoice } from "@/types/invoice";
import { cn } from "@/lib/utils";

interface SalesReportProps {
  invoices: Invoice[];
}

export function SalesReport({ invoices }: SalesReportProps) {
    const metrics = invoices.reduce((acc, inv) => {
        acc.totalBilled += inv.grandTotal || 0;
        acc.totalCollected += inv.amountPaid || 0;
        acc.totalTax += inv.tax || 0;
        return acc;
    }, { totalBilled: 0, totalCollected: 0, totalTax: 0 });

    const collectionRate = metrics.totalBilled > 0 ? (metrics.totalCollected / metrics.totalBilled) * 100 : 100;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-border/50 rounded-3xl overflow-hidden premium-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Banknote className="h-3.5 w-3.5" /> Gross Billed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black tracking-tighter">
                            <CurrencyFormat value={metrics.totalBilled} />
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Total Authorized Billings</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 rounded-3xl overflow-hidden premium-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Wallet className="h-3.5 w-3.5 text-green-500" /> Net Collected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black tracking-tighter text-green-600">
                            <CurrencyFormat value={metrics.totalCollected} />
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Realized Fiscal Liquidity ({collectionRate.toFixed(0)}%)</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 rounded-3xl overflow-hidden premium-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Tax Provision
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black tracking-tighter text-primary">
                            <CurrencyFormat value={metrics.totalTax} />
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Cumulative VAT Obligation</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-3xl border-border/50 bg-card overflow-hidden premium-shadow">
                <CardHeader className="bg-muted/30 border-b px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <History className="h-3.5 w-3.5" /> Recent Fiscal Traces
                    </CardTitle>
                    <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black">CERTIFIED_LEDGER_SYNC</Badge>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 border-none uppercase text-[9px] font-black tracking-[0.2em]">
                                <TableHead className="px-6">Record Identity</TableHead>
                                <TableHead className="px-6">Temporal Sync</TableHead>
                                <TableHead className="px-6">Status</TableHead>
                                <TableHead className="px-6 text-right">Billed Amount</TableHead>
                                <TableHead className="px-6 text-right">Settled</TableHead>
                                <TableHead className="px-6 text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.slice(0, 15).map((invoice) => (
                                <TableRow key={invoice.invoiceId} className="hover:bg-muted/30 transition-colors border-border/50 group">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                <Receipt className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <Fingerprint className="h-3 w-3 text-primary opacity-40" />
                                                    <span className="text-xs font-black uppercase">{invoice.invoiceNumber || invoice.invoiceId.slice(-6)}</span>
                                                </div>
                                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Digital Record</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                                            <FormattedDate date={invoice.issuedAt} formatString="dd MMM yyyy" />
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Badge variant="outline" className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm border-primary/10",
                                            invoice.paymentStatus === 'Paid' ? "bg-green-500/10 text-green-600" : "bg-primary/5 text-primary"
                                        )}>
                                            {invoice.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right font-black text-xs">
                                        <CurrencyFormat value={invoice.grandTotal} />
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right font-black text-xs text-green-600">
                                        <CurrencyFormat value={invoice.amountPaid} />
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right font-black text-xs text-destructive">
                                        <CurrencyFormat value={invoice.balance} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {invoices.length === 0 && (
                        <div className="py-20 text-center opacity-30 italic text-sm text-muted-foreground flex flex-col items-center">
                            <Banknote className="h-10 w-10 mb-2" />
                            No financial traces detected in the active interval.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
