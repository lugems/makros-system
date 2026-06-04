
'use client';

import React, { useMemo } from 'react';
import { Invoice } from '@/types/invoice';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, Query } from 'firebase/firestore';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';

import { FormattedDate } from '@/components/shared/formatted-date';
import { CurrencyFormat } from '@/components/shared/currency-format';
import PaymentStatusBadge from './payment-status-badge';
import { Fingerprint, Car, Hash, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceListProps {
    invoices: Invoice[];
    selectedInvoiceId: string | null;
    onSelectInvoice: (id: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, selectedInvoiceId, onSelectInvoice }) => {
    const db = useFirestore();
    
    const custQuery = useMemo(() => query(collection(db, 'customers')) as Query<Customer>, [db]);
    const vehQuery = useMemo(() => query(collection(db, 'vehicles')) as Query<Vehicle>, [db]);

    const { data: customers } = useCollection<Customer>(custQuery as any);
    const { data: vehicles } = useCollection<Vehicle>(vehQuery as any);

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-[2rem] bg-muted/5 text-muted-foreground opacity-40">
                <Search className="h-10 w-10 mb-2" />
                <p className="text-sm font-medium italic">No ledger records detected.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {invoices.map(invoice => {
                const customer = customers?.find(c => c.customerId === invoice.customerId);
                const vehicle = vehicles?.find(v => v.customerId === invoice.customerId);
                const isActive = selectedInvoiceId === invoice.invoiceId;

                return (
                    <div 
                        key={invoice.invoiceId} 
                        onClick={() => onSelectInvoice(invoice.invoiceId)} 
                        className={cn(
                            "cursor-pointer transition-all p-5 rounded-3xl border bg-card hover:border-primary/40 group relative overflow-hidden",
                            isActive ? "border-primary ring-1 ring-primary/10 bg-primary/[0.02]" : "border-border/50 shadow-sm"
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Fingerprint className="h-3 w-3 text-primary/50" />
                                    <span className="text-[9px] font-mono font-black uppercase text-muted-foreground tracking-widest">
                                        {invoice.invoiceNumber || invoice.invoiceId.slice(-8).toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-none">
                                    {customer?.fullName || 'Registry Void'}
                                </p>
                            </div>
                            <PaymentStatusBadge status={invoice.paymentStatus} className="text-[8px] px-2 py-0.5" />
                        </div>
                        
                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-5">
                            <div className="flex items-center gap-1.5">
                                <Car className="h-3 w-3 opacity-40" />
                                <span className="bg-muted/50 px-1.5 py-0.5 rounded text-[9px] font-mono">{vehicle?.numberPlate || 'UNIT_TBD'}</span>
                            </div>
                            <span className="opacity-30">•</span>
                            <div className="flex items-center gap-1.5">
                                <Hash className="h-3 w-3 opacity-40" />
                                <FormattedDate date={invoice.issuedAt} formatString="dd MMM" />
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-border/50 pt-4">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Certified Total</p>
                            <p className="text-lg font-black text-primary tracking-tighter leading-none">
                                <CurrencyFormat value={invoice.grandTotal} abbreviate />
                            </p>
                        </div>
                        
                        {/* Interactive Left Accent */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1 bg-primary/20 scale-y-0 transition-transform origin-top duration-300",
                            isActive && "scale-y-100"
                        )} />
                    </div>
                );
            })}
        </div>
    );
}
