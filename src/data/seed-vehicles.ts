import { Vehicle } from '@/schemas/vehicle-schema';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    numberPlate: 'UAB 123C',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    chassisNumber: '1234567890',
    owner: 'c1',
    status: 'Active',
  },
  {
    id: 'v2',
    numberPlate: 'UCD 456F',
    make: 'Honda',
    model: 'Civic',
    year: 2018,
    chassisNumber: '0987654321',
    owner: 'c2',
    status: 'Inactive',
  },
];
