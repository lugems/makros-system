'use client';

import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Invoice, PaymentStatus } from '@/types/invoice';
import { JobCardStatus } from '@/types/job-card';
import { WorkshopSettings } from '@/types/settings';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'invoices';

/**
 * ATOMIC TRANSACTION: Generate Invoice from Job Card
 * Aggregates repair data, calculates precise labor and materials, and transitions workflow.
 * Implements atomic sequencing for invoice numbers.
 */
export const generateInvoiceTransaction = async (
  jobCardId: string, 
  userId: string,
  options: { applyTax: boolean; applyDiscount: boolean } = { applyTax: true, applyDiscount: true }
): Promise<string> => {
  // First, fetch parts from the subcollection outside the transaction for calculation
  const partsSnap = await getDocs(collection(db, 'jobCards', jobCardId, 'partsUsed'));
  const partsUsed = partsSnap.docs.map(d => d.data());
  const partsTotal = partsUsed.reduce((sum, p) => sum + (p.quantityUsed * (p.unitPrice || 0)), 0);

  return await runTransaction(db, async (transaction) => {
    const jobCardRef = doc(db, 'jobCards', jobCardId);
    const jobCardSnap = await transaction.get(jobCardRef);
    if (!jobCardSnap.exists()) throw new Error("Job Card dossier not found.");
    
    const jobData = jobCardSnap.data();

    // 1. Pull workshop parameters and handle sequencing
    const settingsRef = doc(db, 'settings', 'workshop');
    const settingsSnap = await transaction.get(settingsRef);
    const settingsData = settingsSnap.exists() ? settingsSnap.data() as WorkshopSettings : { 
      taxRate: 0, 
      defaultDiscount: 0, 
      invoicePrefix: 'INV',
      invoiceStartNumber: 1001 
    } as WorkshopSettings;
    
    // Calibrate rates based on session overrides
    const taxRate = options.applyTax ? (settingsData.taxRate || 0) / 100 : 0;
    const discountRate = options.applyDiscount ? (settingsData.defaultDiscount || 0) / 100 : 0;

    const laborTotal = jobData.laborCost || 0;
    const subtotal = laborTotal + partsTotal;
    
    // Calculations
    const discountAmount = subtotal * discountRate;
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * taxRate;
    const grandTotal = discountedSubtotal + taxAmount;

    // 2. Generate Serial Number
    const nextInvoiceId = settingsData.invoiceStartNumber || 1001;
    const invoicePrefix = settingsData.invoicePrefix || 'INV';
    const invoiceNumber = `${invoicePrefix}-${nextInvoiceId}`;

    const invoiceRef = doc(collection(db, COLLECTION_NAME));
    const invoiceId = invoiceRef.id;

    const invoicePayload: Invoice = {
      invoiceId,
      invoiceNumber,
      jobCardId,
      customerId: jobData.customerId,
      laborTotal,
      partsTotal,
      discount: discountAmount,
      tax: taxAmount,
      grandTotal,
      amountPaid: 0,
      balance: grandTotal,
      paymentStatus: 'Unpaid',
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 3. Commit Records and Increment Sequence
    transaction.set(invoiceRef, invoicePayload);

    transaction.update(settingsRef, {
      invoiceStartNumber: nextInvoiceId + 1,
      updatedAt: serverTimestamp()
    });

    transaction.update(jobCardRef, { 
      status: JobCardStatus.Invoiced, 
      updatedAt: serverTimestamp() 
    });

    // 4. Log Audit Trace
    const auditRef = doc(collection(db, 'auditLogs'));
    transaction.set(auditRef, {
      userId,
      action: 'GENERATE_INVOICE',
      module: 'Invoices',
      recordId: invoiceId,
      description: `Generated record ${invoiceNumber} for Job #${jobCardId.slice(-6)}. Policy: Tax=${options.applyTax}, Discount=${options.applyDiscount}.`,
      createdAt: serverTimestamp(),
    });
    
    return invoiceId;
  });
};

/**
 * Technical Decommissioning Protocol: Cancel Invoice
 * Updates the fiscal state to Cancelled and logs the event.
 */
export const cancelInvoice = (invoiceId: string, userId: string) => {
  const docRef = doc(db, COLLECTION_NAME, invoiceId);
  const payload = { paymentStatus: 'Cancelled' as PaymentStatus, updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  logAudit(userId, 'CANCEL_INVOICE', 'Invoices', invoiceId, `Cancelled billing record in master ledger.`);
};

/**
 * Synchronizes technical metadata for a billing record.
 */
export const updateInvoiceMetadata = (invoiceId: string, data: Partial<Invoice>, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, invoiceId);
    const payload = { ...data, updatedAt: serverTimestamp() };
    
    updateDoc(docRef, payload).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: payload,
      } satisfies SecurityRuleContext));
    });
  
    logAudit(userId, 'UPDATE_INVOICE', 'Invoices', invoiceId, `Synchronized fiscal metadata for record.`);
};
