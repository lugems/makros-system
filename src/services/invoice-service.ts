import { Invoice, PaymentStatus } from '../types';
import { calculateInvoiceTotals } from '../lib/invoice-calculations';

/**
 * Technical helper for in-memory invoice simulations.
 * This is primarily for backward compatibility with older components.
 */

export const createInvoice = (invoiceData: any): any => {
    const totals = calculateInvoiceTotals({
        laborTotal: invoiceData.laborTotal || 0,
        partsTotal: invoiceData.partsTotal || 0,
        discount: invoiceData.discount || 0,
        tax: invoiceData.tax || 0,
        amountPaid: 0
    });

    return {
        ...invoiceData,
        ...totals,
        invoiceId: `inv-${Date.now()}`,
        issuedAt: new Date().toISOString()
    };
}
