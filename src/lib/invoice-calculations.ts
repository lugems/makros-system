import type { Invoice, PaymentStatus } from "@/types/invoice";
import { JobCard } from '../types/job-card';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'labor' | 'part';
}

/**
 * Calculates current totals, balance, and payment status for an invoice.
 */
export function calculateInvoiceTotals(input: {
  laborTotal: number;
  partsTotal: number;
  discount: number;
  tax: number;
  amountPaid: number;
}) {
  const laborTotal = Math.max(0, input.laborTotal || 0);
  const partsTotal = Math.max(0, input.partsTotal || 0);
  const discount = Math.max(0, input.discount || 0);
  const tax = Math.max(0, input.tax || 0);
  const amountPaid = Math.max(0, input.amountPaid || 0);

  const subtotal = laborTotal + partsTotal;
  const safeDiscount = Math.min(discount, subtotal);
  const grandTotal = Math.max(0, subtotal - safeDiscount + tax);
  const balance = Math.max(0, grandTotal - amountPaid);

  return {
    laborTotal,
    partsTotal,
    subtotal,
    discount: safeDiscount,
    tax,
    grandTotal,
    amountPaid,
    balance,
    paymentStatus: getPaymentStatus(grandTotal, amountPaid),
  };
}

/**
 * Determines the payment status based on the total due and amount received.
 */
export function getPaymentStatus(
  grandTotal: number,
  amountPaid: number
): PaymentStatus {
  if (amountPaid <= 0) return "Unpaid";
  if (amountPaid >= grandTotal && grandTotal > 0) return "Paid";
  return "Partially Paid";
}

/**
 * Formats an invoice number with a prefix.
 */
export function formatInvoiceNumber(prefix: string, number: number) {
  return `${prefix}-${number}`;
}

/**
 * Generates line items for an invoice based on the associated job card.
 */
export function getInvoiceLineItems(invoice: Partial<Invoice> | null, jobCard?: JobCard): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = [];

  if (jobCard) {
    items.push({
      description: `Labor: ${jobCard.reportedIssue || 'Vehicle Service'}`,
      quantity: 1,
      unitPrice: jobCard.laborCost || 0,
      total: jobCard.laborCost || 0,
      type: 'labor'
    });
  }

  if (invoice && invoice.partsTotal && invoice.partsTotal > 0 && items.length === 0) {
      items.push({
          description: 'Parts & Materials',
          quantity: 1,
          unitPrice: invoice.partsTotal,
          total: invoice.partsTotal,
          type: 'part'
      });
  }

  return items;
}

/**
 * Backward compatibility helper for legacy creation logic.
 */
export function calculateInvoice(invoiceData: {
    laborTotal?: number;
    partsTotal?: number;
    discount?: number;
    taxRate?: number;
    amountPaid?: number;
}) {
    const labor = invoiceData.laborTotal || 0;
    const parts = invoiceData.partsTotal || 0;
    const discount = invoiceData.discount || 0;
    const taxRate = invoiceData.taxRate || 0;
    
    const subtotal = labor + parts;
    const taxAmount = (subtotal - discount) * taxRate;
    
    return calculateInvoiceTotals({
        laborTotal: labor,
        partsTotal: parts,
        discount,
        tax: taxAmount,
        amountPaid: invoiceData.amountPaid || 0
    });
}