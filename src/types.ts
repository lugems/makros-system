export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  fullName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  name: string;
  description?: string;
  cost: number;
}

export type JobCardStatus = 'Received' | 'Pending' | 'In Progress' | 'Completed';

export interface JobCard {
  jobCardId: string;
  jobId: string;
  customer: Customer;
  vehicleDetails: string;
  services: Service[];
  totalCost: number;
  status: JobCardStatus;
  createdAt: string;
  updatedAt: string;
  receivedAt: string;
  completedAt?: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';

export interface Invoice {
  invoiceId: string;
  jobCard: JobCard;
  dateIssued: string;
  dueDate: string;
  isPaid: boolean;
  grandTotal: number;
  balance: number;
  paymentStatus: PaymentStatus;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
  laborTotal: number;
  partsTotal: number;
  discount: number;
  tax: number;
  amountPaid: number;
}

export interface InventoryItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'Admin' | 'Mechanic' | 'Service Advisor';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
