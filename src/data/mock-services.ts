import { Service } from '@/types/makros-service';

export const mockServices: Service[] = [
  {
    serviceId: 'S001',
    name: 'Oil Change',
    description: 'Basic oil and filter change.',
    estimatedTime: 30, // in minutes
    defaultLaborCost: 50,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    serviceId: 'S002',
    name: 'Tire Rotation',
    description: 'Tire rotation and pressure check.',
    estimatedTime: 45,
    defaultLaborCost: 75,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    serviceId: 'S003',
    name: 'Full Inspection',
    description: 'Complete vehicle inspection.',
    estimatedTime: 120,
    defaultLaborCost: 200,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
    {
    serviceId: 'S004',
    name: 'Engine Diagnostic',
    description: 'Advanced engine diagnostic service',
    estimatedTime: 90,
    defaultLaborCost: 150,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
