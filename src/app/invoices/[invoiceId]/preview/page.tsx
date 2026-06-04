'use client';

import React, { useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { LoadingState } from '@/components/shared/loading-state';
import { Invoice } from '@/types/invoice';
import InvoicePreview from '@/components/invoices/invoice-preview';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

/**
 * @fileOverview Technical Standalone Preview Terminal.
 * Provides a shell-free document environment for high-fidelity printing and PDF export.
 * Optimized for browser print engine orchestration.
 */
export default function Page({ params }: { params: Promise<{ invoiceId: string }> }) {
  const resolvedParams = React.use(params);
  const db = useFirestore();
  const router = useRouter();
  const { role, isLoading: authLoading } = useAuth();

  const isAuthorized = useMemo(() => 
    ['Makros System Owner', 'Workshop Manager', 'Accountant', 'Receptionist', 'Customer'].includes(role || ''), 
    [role]
  );

  const invoiceRef = useMemo(() => doc(db, 'invoices', resolvedParams.invoiceId) as DocumentReference<Invoice>, [db, resolvedParams.invoiceId]);
  const { data: invoice, loading: invLoading } = useDoc<Invoice>(invoiceRef as any);

  if (authLoading || invLoading) return <LoadingState />;

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-black uppercase">Clearance Restricted</h2>
        <p className="text-muted-foreground italic">You do not have the required authority to access this financial preview.</p>
        <Button onClick={() => router.push('/dashboard')}>Return to Command</Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-4">
        <FileText className="h-16 w-16 opacity-20" />
        <h2 className="text-2xl font-black uppercase">Record Not Located</h2>
        <p className="text-muted-foreground italic">The requested billing dossier could not be retrieved from the ledger.</p>
        <Button onClick={() => router.push('/invoices')}>Return to Ledger</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 sm:py-10">
      {/* Navigation - Hidden during print */}
      <div className="max-w-5xl mx-auto px-4 mb-4 flex justify-between items-center no-print">
        <Button variant="ghost" onClick={() => router.back()} className="font-black uppercase tracking-widest text-[10px] gap-2">
            <ArrowLeft className="h-4 w-4" /> Exit Preview
        </Button>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Makros Certified Document OS</p>
      </div>
      
      {/* Certified Document - Visible during print */}
      <div className="print:m-0 print:p-0">
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
}
