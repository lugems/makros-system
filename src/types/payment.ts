export type PaymentMethod =
  | "Cash"
  | "Mobile Money"
  | "Bank Transfer"
  | "Card"
  | "Credit";

export interface Payment {
  paymentId: string;
  receiptNumber?: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: string | PaymentMethod;
  transactionRef?: string;
  status: 'Pending' | 'Completed' | 'Failed';
  paidAt: string;
  createdAt: string;
  createdBy: string;
}
