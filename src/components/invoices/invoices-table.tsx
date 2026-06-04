'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Trash, Printer, Download, Plus } from 'lucide-react';

import { Invoice } from '@/types/invoice';
import useMakrosStore from '@/store/makros-store';
import PaymentStatusBadge from './payment-status-badge';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { calculateInvoiceTotals } from '@/lib/invoice-calculations';

export interface InvoicesTableProps {
  invoices: Invoice[];
  onViewDetails: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  onCancel: (invoice: Invoice) => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ 
    invoices, 
    onViewDetails,
    onRecordPayment,
    onPrint,
    onDownload,
    onCancel,
}) => {
  const { customers, vehicles, currentUser } = useMakrosStore();

  const userRole = currentUser?.role || 'Receptionist';
  const hasPermission = (allowedRoles: string[]) => allowedRoles.includes(userRole);

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 uppercase text-[10px] font-bold tracking-widest">
            <TableHead>Invoice</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Issued Date</TableHead>
            <TableHead className="text-right">Grand Total</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map(invoice => {
            const customer = customers.find(c => c.customerId === invoice.customerId);
            const vehicle = vehicles.find(v => v.customerId === invoice.customerId);
            const totals = calculateInvoiceTotals(invoice);
            
            return (
              <TableRow 
                key={invoice.invoiceId} 
                onClick={() => onViewDetails(invoice)} 
                className="cursor-pointer hover:bg-muted/30 transition-colors"
              >
                  <TableCell className="font-bold text-primary">
                    {invoice.invoiceNumber || invoice.invoiceId.slice(-6)}
                  </TableCell>
                  <TableCell className="font-medium">{customer?.fullName || 'N/A'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {vehicle?.make} {vehicle?.model}
                  </TableCell>
                  <TableCell className="text-xs">
                    <FormattedDate date={invoice.issuedAt} formatString="dd MMM yyyy" />
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    <CurrencyFormat value={totals.grandTotal} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={totals.balance > 0 ? 'text-destructive font-bold' : 'text-green-600'}>
                        <CurrencyFormat value={totals.balance} />
                    </span>
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={totals.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => onViewDetails(invoice)}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              
                              {hasPermission(['Garage Owner', 'Accountant']) && !['Paid', 'Cancelled'].includes(totals.paymentStatus) && (
                                  <DropdownMenuItem onClick={() => onRecordPayment(invoice)}>
                                      <Plus className="mr-2 h-4 w-4" /> Record Payment
                                  </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              {hasPermission(['Garage Owner', 'Accountant', 'Receptionist']) && (
                                  <>
                                    <DropdownMenuItem onClick={() => onPrint(invoice)}>
                                        <Printer className="mr-2 h-4 w-4" /> Print
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDownload(invoice)}>
                                        <Download className="mr-2 h-4 w-4" /> Download
                                    </DropdownMenuItem>
                                  </>
                              )}

                              {hasPermission(['Garage Owner', 'Accountant']) && totals.paymentStatus !== 'Cancelled' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive" 
                                        onClick={() => onCancel(invoice)}
                                    >
                                        <Trash className="mr-2 h-4 w-4" /> Cancel Invoice
                                    </DropdownMenuItem>
                                  </>
                              )}
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
              </TableRow>
            );
          })}
          {invoices.length === 0 && (
              <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic">
                      No invoices found matching the current filters.
                  </TableCell>
              </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoicesTable;
