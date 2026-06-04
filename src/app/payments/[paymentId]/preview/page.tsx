'use client';

import React, { useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { LoadingState } from '@/components/shared/loading-state';
import { Payment } from '@/types/payment';
import { ReceiptPreview } from '@/components/payments/receipt-preview';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { FileCheck, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

/**
 * @fileOverview Technical Standalone Receipt Preview Terminal.
 * Provides a shell-free environment optimized for print orchestration.
 * Standardized with Invoice preview layout.
 */
export default function Page() {
  const params = useParams();
  const paymentId = params.paymentId as string;
  const db = useFirestore();
  const router = useRouter();
  const { role, isLoading: authLoading } = useAuth();

  const isAuthorized = useMemo(() => 
    ['Makros System Owner', 'Workshop Manager', 'Accountant', 'Receptionist', 'Customer'].includes(role || ''), 
    [role]
  );

  const paymentRef = useMemoFirebase(() => doc(db, 'payments', paymentId) as DocumentReference<Payment>, [db, paymentId]);
  const { data: payment, loading: payLoading } = useDoc<Payment>(paymentRef);

  if (authLoading || payLoading) return <LoadingState />;

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-black uppercase">Clearance Restricted</h2>
        <p className="text-muted-foreground italic">Insufficient authority to access this financial record.</p>
        <Button onClick={() => router.push('/dashboard')}>Return to Command</Button>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-4">
        <FileCheck className="h-16 w-16 opacity-20" />
        <h2 className="text-2xl font-black uppercase">Record Not Located</h2>
        <p className="text-muted-foreground italic">The requested settlement record could not be retrieved from the ledger.</p>
        <Button onClick={() => router.push('/payments')}>Return to Treasury</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 sm:py-10">
      {/* Navigation - Hidden during print */}
      <div className="max-w-5xl mx-auto px-4 mb-4 flex justify-between items-center no-print">
        <Button variant="ghost" onClick={() => router.back()} className="font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-primary/10 rounded-xl px-6">
            <ArrowLeft className="h-4 w-4" /> Exit Preview
        </Button>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Makros Certified Document OS</p>
      </div>
      
      {/* Certified Document - Visible during print */}
      <div className="print:m-0 print:p-0">
        <ReceiptPreview payment={payment} isStandalone />
      </div>
    </div>
  );
}