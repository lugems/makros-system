'use client';

import { 
  collection, 
  doc, 
  getDocs, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Invoice } from '@/types/invoice';
import { JobCardStatus } from '@/types/job-card';
import { logAudit } from '@/lib/audit-logger';

const COLLECTION_NAME = 'invoices';

/**
 * ATOMIC TRANSACTION: Generate Invoice from Job Card
 * Aggregates repair data, calculates precise labor and materials, and transitions workflow.
 * Accepts overrides for tax and discount application based on the intake session choice.
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

    // Pull workshop parameters from master settings
    const settingsRef = doc(db, 'settings', 'workshop');
    const settingsSnap = await transaction.get(settingsRef);
    const settingsData = settingsSnap.exists() ? settingsSnap.data() : { 
      taxRate: 0, 
      defaultDiscount: 0, 
      invoicePrefix: 'INV' 
    };
    
    // Calibrate rates based on session overrides provided from the UI
    const taxRate = options.applyTax ? (settingsData.taxRate || 0) / 100 : 0;
    const discountRate = options.applyDiscount ? (settingsData.defaultDiscount || 0) / 100 : 0;

    const laborTotal = jobData.laborCost || 0;
    const subtotal = laborTotal + partsTotal;
    
    // Calculate Discount Amount (Applied to Subtotal)
    const discountAmount = subtotal * discountRate;
    const discountedSubtotal = subtotal - discountAmount;
    
    // Calculate Tax Amount (Applied to Discounted Subtotal)
    const taxAmount = discountedSubtotal * taxRate;
    const grandTotal = discountedSubtotal + taxAmount;

    const invoiceRef = doc(collection(db, COLLECTION_NAME));
    const invoiceId = invoiceRef.id;
    const invoiceNumber = `${settingsData.invoicePrefix || 'INV'}-${Date.now().toString().slice(-4)}`;

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

    // 1. Commit Certified Invoice Record
    transaction.set(invoiceRef, invoicePayload);

    // 2. Transition Job Card Workflow State
    transaction.update(jobCardRef, { 
      status: JobCardStatus.Invoiced, 
      updatedAt: serverTimestamp() 
    });

    // 3. Log Immutable Audit Trace
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
