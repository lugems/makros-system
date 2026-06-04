import { Customer, Vehicle, JobCard, InventoryItem, User } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  { customerId: 'c1', fullName: 'John Wick', phone: '+1 555 0123', email: 'john@assassin.com', address: '123 Baba Yaga Lane', status: 'ACTIVE', createdAt: '2023-10-01' },
  { customerId: 'c2', fullName: 'Sarah Connor', phone: '+1 555 9999', email: 'sarah@resistance.net', address: 'Unknown Bunker', status: 'ACTIVE', createdAt: '2023-11-15' },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { vehicleId: 'v1', customerId: 'c1', numberPlate: 'BABA-YGA', make: 'Ford', model: 'Mustang Mach 1', year: 1969, mileage: 45000, lastService: '2024-01-10' },
  { vehicleId: 'v2', customerId: 'c2', numberPlate: 'CYBER-X', make: 'Toyota', model: 'Hilux', year: 2022, mileage: 15000, lastService: '2024-02-05' },
];

export const MOCK_JOB_CARDS: JobCard[] = [
  { jobCardId: 'jc1', customerId: 'c1', vehicleId: 'v1', status: 'IN_PROGRESS', reportedIssue: 'Engine overheating and suspension squeaking', laborCost: 450, createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-01T14:30:00Z' },
  { jobCardId: 'jc2', customerId: 'c2', vehicleId: 'v2', status: 'WAITING_PARTS', reportedIssue: 'Brake pad replacement and oil change', laborCost: 120, createdAt: '2024-03-02T08:00:00Z', updatedAt: '2024-03-02T09:00:00Z' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { itemId: 'i1', itemName: 'Full Synthetic Oil 5W-30', category: 'Oils', quantity: 45, sellingPrice: 55.00, reorderLevel: 10 },
  { itemId: 'i2', itemName: 'Brake Pads (Rear)', category: 'Spare Parts', quantity: 4, sellingPrice: 120.00, reorderLevel: 5 },
  { itemId: 'i3', itemName: 'Air Filter (Universal)', category: 'Spare Parts', quantity: 22, sellingPrice: 35.00, reorderLevel: 5 },
];

export const CURRENT_USER: User = {
  userId: 'u1',
  fullName: 'Workshop Master',
  role: 'OWNER',
  email: 'admin@garagesync.com',
  status: 'ACTIVE'
};
