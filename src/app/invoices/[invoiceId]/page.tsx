'use client';

import React, { useMemo, useState } from 'react';
import { InvoiceDetails } from '@/components/invoices/invoice-details';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { LoadingState } from '@/components/shared/loading-state';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft } from 'lucide-react';
import RecordPaymentDialog from '@/components/invoices/record-payment-dialog';

/**
 * @fileOverview Client-side entry for invoice details.
 * Fetches real-time data from Firestore to ensure forensic accuracy.
 * Managed locally: RecordPaymentDialog for immediate collection entry.
 */
export default function Page({ params }: { params: Promise<{ invoiceId: string }> }) {
    const resolvedParams = React.use(params);
    const db = useFirestore();
    const router = useRouter();

    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

    const invoiceRef = useMemoFirebase(() => doc(db, 'invoices', resolvedParams.invoiceId) as DocumentReference<Invoice>, [db, resolvedParams.invoiceId]);
    const { data: invoice, loading } = useDoc<Invoice>(invoiceRef as any);

    if (loading) return <LoadingState />;

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <div className="h-20 w-20 rounded-[2rem] bg-muted flex items-center justify-center border border-border/50 shadow-sm">
                    <FileText className="h-10 w-10 opacity-20" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight">Record Not Found</h3>
                    <p className="text-muted-foreground text-sm font-medium italic">
                        The requested billing dossier could not be located in the ledger.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/invoices')} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8 gap-2">
                    <ArrowLeft className="h-3.5 w-3.5" /> Return to Ledger
                </Button>
            </div>
        );
    }

  return (
    <div className="space-y-8">
        <header className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/invoices')} className="h-10 w-10 rounded-xl hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter font-headline">Billing Dossier</h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Certified Financial Record</p>
            </div>
        </header>

        <InvoiceDetails 
            invoice={invoice} 
            onRecordPayment={() => setIsRecordPaymentOpen(true)} 
            onCancel={() => {}} 
            onEdit={() => {}}
            onPreview={(inv) => router.push(`/invoices/${inv.invoiceId}/preview`)}
        />

        {isRecordPaymentOpen && (
            <RecordPaymentDialog 
                invoice={invoice}
                isOpen={isRecordPaymentOpen}
                onClose={() => setIsRecordPaymentOpen(false)}
            />
        )}
    </div>
  );
}
