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
  'Senior Mechanic / Lead Mechanic': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos', 'staff:view'],
  'Mechanic': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos'],
  'Diagnostic Technician': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos'],
  'Auto-Wiring Technician': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos'],
  'Welding Lead Technician': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos'],
  'Welding Technician': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos'],
  'Auto Body / Panel Beater': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos'],
  'Painter': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos'],
  'Tyre & Wheel Technician': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos'],
  'Car Wash / Detailing Technician': ['job-cards:assigned', 'job-tasks', 'status-updates', 'photos'],
  'Quality Control Officer': ['job-cards', 'status-updates', 'staff:view'],
  'Inventory Officer': ['inventory', 'suppliers', 'stock-reports', 'staff:view'],
  'Accountant': ['invoices', 'payments', 'financial-reports', 'staff:view'],
  'Customer': ['portal'],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  if (permissions[role]?.includes('*')) {
    return true;
  }
  return permissions[role]?.includes(permission) ?? false;
}
