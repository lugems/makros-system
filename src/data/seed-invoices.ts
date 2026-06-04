import { Invoice } from '@/schemas/invoice-schema';

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-001',
    customerName: 'John Doe',
    vehicleDetails: 'Toyota Camry (UAB 123C)',
    date: '2024-03-20T12:00:00Z',
    status: 'Unpaid',
    tasks: [
      { id: 't1', description: 'Engine Oil Change', price: 50.00 },
      { id: 't2', description: 'Brake Inspection', price: 40.00 }
    ],
    parts: [
      { id: 'p1', name: 'Engine Oil 5W-30', quantityUsed: 1, price: 45.00 },
      { id: 'p2', name: 'Oil Filter', quantityUsed: 1, price: 15.00 }
    ],
    discount: 0,
    taxRate: 0.1
  },
  {
    id: 'INV-002',
    customerName: 'Jane Smith',
    vehicleDetails: 'Honda Civic (UCD 456F)',
    date: '2024-03-21T14:00:00Z',
    status: 'Paid',
    tasks: [
      { id: 't3', description: 'Tire Rotation', price: 30.00 }
    ],
    parts: [],
    discount: 5.00,
    taxRate: 0.1
  }
];
