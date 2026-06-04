import { Payment } from '@/schemas/payment-schema';

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'PAY-001',
    invoiceId: 'INV-002',
    customerName: 'Jane Smith',
    amount: 100.00,
    date: '2024-03-21T14:30:00Z',
    paymentMethod: 'Credit Card',
    transactionReference: 'TXN-998877'
  },
  {
    id: 'PAY-002',
    invoiceId: 'INV-001',
    customerName: 'John Doe',
    amount: 50.00,
    date: '2024-03-22T10:15:00Z',
    paymentMethod: 'Cash',
  }
];
