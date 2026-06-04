export type Role = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'MECHANIC' | 'INVENTORY' | 'ACCOUNTANT' | 'CUSTOMER';

export interface User {
  userId: string;
  fullName: string;
  role: Role;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Customer {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Vehicle {
  vehicleId: string;
  customerId: string;
  numberPlate: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  lastService: string;
}

export interface JobCard {
  jobCardId: string;
  customerId: string;
  vehicleId: string;
  assignedMechanicId?: string;
  reportedIssue: string;
  status: JobCardStatus;
  laborCost: number;
  createdAt: string;
  updatedAt: string;
}

export type JobCardStatus = 
  | 'RECEIVED'
  | 'DIAGNOSING'
  | 'WAITING_APPROVAL'
  | 'WAITING_PARTS'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'COMPLETED'
  | 'INVOICED'
  | 'PAID'
  | 'DELIVERED'
  | 'CANCELLED';

export interface InventoryItem {
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  sellingPrice: number;
  reorderLevel: number;
}
