'use client';

import { 
  collection, 
  doc, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Payment } from '@/types/payment';
import { WorkshopSettings } from '@/types/settings';
import { logAudit } from '@/lib/audit-logger';
import { getPaymentStatus } from '@/lib/invoice-calculations';

const COLLECTION_NAME = 'payments';

/**
 * ATOMIC TRANSACTION: Record Settlement
 * Implements atomic sequencing for receipt numbers.
 */
export const recordPaymentTransaction = async (
  data: Omit<Payment, 'paymentId' | 'status' | 'paidAt' | 'createdAt' | 'createdBy' | 'receiptNumber'>, 
  userId: string
) => {
  await runTransaction(db, async (transaction) => {
    const invoiceRef = doc(db, 'invoices', data.invoiceId);
    const paymentRef = doc(collection(db, COLLECTION_NAME));
    const invoicePaymentRef = doc(db, 'invoices', data.invoiceId, 'payments', paymentRef.id);
    const settingsRef = doc(db, 'settings', 'workshop');
    
    // Fetch dependencies
    const invoiceSnap = await transaction.get(invoiceRef);
    if (!invoiceSnap.exists()) throw new Error("Invoice record not found.");
    
    const settingsSnap = await transaction.get(settingsRef);
    const settingsData = settingsSnap.exists() ? settingsSnap.data() as WorkshopSettings : {
        receiptPrefix: 'REC',
        receiptStartNumber: 1001
    } as WorkshopSettings;

    const invoiceData = invoiceSnap.data();
    const currentPaid = invoiceData.amountPaid || 0;
    const grandTotal = invoiceData.grandTotal || 0;
    
    const newAmountPaid = currentPaid + data.amount;
    const newBalance = Math.max(0, grandTotal - newAmountPaid);
    const newStatus = getPaymentStatus(grandTotal, newAmountPaid);

    // 1. Generate Receipt Sequence
    const nextReceiptId = settingsData.receiptStartNumber || 1001;
    const receiptPrefix = settingsData.receiptPrefix || 'REC';
    const receiptNumber = `${receiptPrefix}-${nextReceiptId}`;

    const paymentData = {
      ...data,
      paymentId: paymentRef.id,
      receiptNumber,
      status: 'Completed',
      paidAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      createdBy: userId
    };

    // 2. Commit Records
    transaction.set(paymentRef, paymentData);
    transaction.set(invoicePaymentRef, paymentData);

    // 3. Update Settings Sequence
    transaction.update(settingsRef, {
      receiptStartNumber: nextReceiptId + 1,
      updatedAt: serverTimestamp()
    });

    // 4. Synchronize fiscal balance on Invoice
    transaction.update(invoiceRef, {
      amountPaid: newAmountPaid,
      balance: newBalance,
      paymentStatus: newStatus,
      updatedAt: serverTimestamp()
    });

    // 5. Log Audit Trace
    const auditRef = doc(collection(db, 'auditLogs'));
    transaction.set(auditRef, {
      userId,
      action: 'RECORD_PAYMENT',
      module: 'Payments',
      recordId: paymentRef.id,
      description: `Settled Ush ${data.amount.toLocaleString()} for Invoice #${invoiceData.invoiceNumber || data.invoiceId.slice(-6)}. Receipt generated: ${receiptNumber}.`,
      createdAt: serverTimestamp(),
    });
  });
};
