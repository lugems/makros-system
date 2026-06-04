'use client';

import { 
  collection, 
  doc, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Payment } from '@/types/payment';
import { logAudit } from '@/lib/audit-logger';
import { getPaymentStatus } from '@/lib/invoice-calculations';

const COLLECTION_NAME = 'payments';

/**
 * ATOMIC TRANSACTION: Record Settlement
 * 1. Creates top-level payment record.
 * 2. Adds payment to invoice subcollection.
 * 3. Atomically updates invoice balance and status.
 * 4. Logs audit trace.
 */
export const recordPaymentTransaction = async (
  data: Omit<Payment, 'paymentId' | 'status' | 'paidAt' | 'createdAt' | 'createdBy'>, 
  userId: string
) => {
  await runTransaction(db, async (transaction) => {
    const invoiceRef = doc(db, 'invoices', data.invoiceId);
    const paymentRef = doc(collection(db, COLLECTION_NAME));
    const invoicePaymentRef = doc(db, 'invoices', data.invoiceId, 'payments', paymentRef.id);
    
    const invoiceSnap = await transaction.get(invoiceRef);
    if (!invoiceSnap.exists()) throw new Error("Invoice record not found.");
    
    const invoiceData = invoiceSnap.data();
    const currentPaid = invoiceData.amountPaid || 0;
    const grandTotal = invoiceData.grandTotal || 0;
    
    const newAmountPaid = currentPaid + data.amount;
    const newBalance = Math.max(0, grandTotal - newAmountPaid);
    const newStatus = getPaymentStatus(grandTotal, newAmountPaid);

    const paymentData = {
      ...data,
      paymentId: paymentRef.id,
      status: 'Completed',
      paidAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      createdBy: userId
    };

    // 1. Create global settlement record
    transaction.set(paymentRef, paymentData);

    // 2. Create invoice-linked record
    transaction.set(invoicePaymentRef, paymentData);

    // 3. Synchronize fiscal balance on Invoice
    transaction.update(invoiceRef, {
      amountPaid: newAmountPaid,
      balance: newBalance,
      paymentStatus: newStatus,
      updatedAt: serverTimestamp()
    });

    // 4. Log Audit Trace
    const auditRef = doc(collection(db, 'auditLogs'));
    transaction.set(auditRef, {
      userId,
      action: 'RECORD_PAYMENT',
      module: 'Payments',
      recordId: paymentRef.id,
      description: `Settled Ush ${data.amount.toLocaleString()} for Invoice #${invoiceData.invoiceNumber || data.invoiceId.slice(-6)}.`,
      createdAt: serverTimestamp(),
    });
  });
};
