export type PaymentStatus = 
  | "Unpaid"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled";

export interface Invoice {
  invoiceId: string;
  invoiceNumber?: string;
  jobCardId: string;
  customerId: string;
  laborTotal: number;
  partsTotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  amountPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
  issuedAt: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}