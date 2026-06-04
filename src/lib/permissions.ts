import { UserRole } from '@/types/staff';

const permissions: { [key in UserRole]: string[] } = {
  'Makros System Owner': ['*'],
  'Workshop Manager': [
    'dashboard',
    'customers',
    'vehicles',
    'bookings',
    'job-cards',
    'inventory',
    'staff',
    'reports',
  ],
  'Receptionist': ['customers', 'vehicles', 'bookings', 'job-cards:basic'],
  'Mechanic': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos'],
  'Inventory Officer': ['inventory', 'suppliers', 'stock-reports'],
  'Accountant': ['invoices', 'payments', 'financial-reports'],
  'Customer': ['portal'],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  if (permissions[role]?.includes('*')) {
    return true;
  }
  return permissions[role]?.includes(permission) ?? false;
}
